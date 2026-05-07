"""
Authentication and authorization routes for the Millet MIS API.

This module validates public registration, verifies officer login credentials,
creates JWT sessions, and enforces role-based access for administrative,
district, and block-level operations. It is security-sensitive and should be
reviewed carefully during NIC handover and penetration testing.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..database import get_db
from ..rate_limit import limiter
from ..security import create_access_token, decode_token, hash_password, verify_password
from .auth_roles import (
    PUBLIC_REGISTRATION_ROLE,
    ROLE_MAP,
    canonical_role_value as _canonical_role_value,
    normalize_role as _normalize_role,
)
from .auth_schemas import (
    AuthResponse,
    UpdateBlockOfficerDetailsRequest,
    UpdateBlockOfficerRequest,
    UpdateOfficerDetailsRequest,
    UpdateUserRoleRequest,
    UserLogin,
    UserRegister,
)
from .auth_session import AUTH_COOKIE_NAME, make_auth_response, make_logout_response

router = APIRouter(prefix="/auth", tags=["Authentication"])

BLOCK_OFFICER_ROLE_SQL = "REPLACE(LOWER(CAST(role AS TEXT)), ' ', '_') IN ('block', 'block_officer')"
BLOCK_OFFICER_ROLE_SQL_WITH_ALIAS = (
    "REPLACE(LOWER(CAST(u.role AS TEXT)), ' ', '_') IN ('block', 'block_officer')"
)


def _active_user(user) -> bool:
    """Check whether a database user mapping is active."""
    try:
        return int(user.get("is_active") or 0) == 1
    except (TypeError, ValueError):
        return False


def _user_response(user) -> dict:
    """Build the sanitized user object returned to the React client."""
    return {
        "id": user["id"],
        "username": user["username"],
        "email": user.get("email"),
        "full_name": user.get("full_name"),
        "mobile": user.get("mobile"),
        "role": _normalize_role(user.get("role")),
        "district": user.get("district"),
        "block": user.get("block"),
    }


def _block_officer_response(user) -> dict:
    """Build the limited user object returned to district officers."""
    return {
        "id": user["id"],
        "name": user.get("full_name") or "",
        "mobile": user.get("mobile") or "",
        "block": user.get("block") or "",
        "district": user.get("district") or "",
    }


def _users_table_has_column(db: Session, column_name: str) -> bool:
    """Check whether an optional users-table column exists without altering schema."""
    return bool(
        db.execute(
            text(
                """
                SELECT EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_schema = current_schema()
                      AND table_name = 'users'
                      AND column_name = :column_name
                )
                """
            ),
            {"column_name": column_name},
        ).scalar()
    )


def _fetch_user_by_username(db: Session, username: str):
    """Fetch a single user row by username using a parameterized query."""
    return db.execute(
        text(
            """
            SELECT
                id,
                username,
                email,
                hashed_password,
                full_name,
                COALESCE(to_jsonb(u) ->> 'mobile', '') AS mobile,
                role,
                district,
                block,
                is_active
            FROM users AS u
            WHERE username = :username
            LIMIT 1
            """
        ),
        {"username": username},
    ).mappings().first()


def _fetch_user_by_id(db: Session, user_id: int):
    """Fetch a non-secret user row by internal identifier."""
    return db.execute(
        text(
            """
            SELECT
                id,
                username,
                email,
                full_name,
                COALESCE(to_jsonb(u) ->> 'mobile', '') AS mobile,
                role,
                district,
                block,
                is_active
            FROM users AS u
            WHERE id = :id
            LIMIT 1
            """
        ),
        {"id": user_id},
    ).mappings().first()


def _fetch_district_block_officer(db: Session, user_id: int, district: str):
    """Fetch one block officer constrained to the district officer's district."""
    return db.execute(
        text(
            f"""
            SELECT id, full_name, COALESCE(to_jsonb(u) ->> 'mobile', '') AS mobile, district, block
            FROM users AS u
            WHERE id = :id
              AND district = :district
              AND {BLOCK_OFFICER_ROLE_SQL_WITH_ALIAS}
            LIMIT 1
            """
        ),
        {"id": user_id, "district": district},
    ).mappings().first()


def _validate_scope_fields(user):
    """Ensure officer roles have required geographic scope assignments."""
    role = _normalize_role(user.get("role"))
    if role in {"district", "block"} and not user.get("district"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is missing district assignment",
        )
    if role == "block" and not user.get("block"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is missing block assignment",
        )


def _password_matches(password: str, hashed_password: Optional[str]) -> bool:
    """Safely verify a password while treating malformed hashes as login failure."""
    if not hashed_password:
        return False
    try:
        return verify_password(password, hashed_password)
    except (TypeError, ValueError):
        return False


async def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Resolve the current authenticated user from the session cookie.

    Args:
        request (Request): Request containing the signed session cookie.
        db (Session): Request-scoped database session.

    Returns:
        Mapping: Active user row for downstream role checks.

    Raises:
        HTTPException: When token validation fails or the user is inactive.
    """
    token = request.cookies.get(AUTH_COOKIE_NAME)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    payload = decode_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    username = payload.get("sub")
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

    user = _fetch_user_by_username(db, username)
    if user is None or not _active_user(user):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
    return user


def require_role(*allowed_roles):
    """
    Build a FastAPI dependency that restricts access by role.

    Args:
        *allowed_roles: Role names or numeric role identifiers allowed for the
            protected route.

    Returns:
        Callable: Dependency that returns the current user when authorized.
    """
    allowed_role_names = {
        _canonical_role_value(ROLE_MAP.get(role, role) if isinstance(role, int) else role)
        for role in allowed_roles
    }

    async def check_role(current_user=Depends(get_current_user)):
        """
        Validate that the current user has one of the required roles.

        Raises:
            HTTPException: When the user lacks the required role or scope.
        """
        current_role = _normalize_role(current_user.get("role"))
        if current_role not in allowed_role_names:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This action requires one of the following roles: {', '.join(sorted(allowed_role_names))}",
            )
        _validate_scope_fields(current_user)
        return current_user

    return check_role


@router.post("/register", response_model=AuthResponse)
@limiter.limit("10/minute")
def register(request: Request, user_data: UserRegister, db: Session = Depends(get_db)):
    """
    Register a public farmer account and issue a cookie session.

    Public registration is deliberately limited to farmer role creation. This
    prevents self-service creation of administrator or officer accounts.

    Args:
        request (Request): FastAPI request object used by the rate limiter.
        user_data (UserRegister): Validated registration payload.
        db (Session): Request-scoped database session.

    Returns:
        dict: Sanitized user details.

    Raises:
        HTTPException: When the username/email exists or privileged registration
            is attempted.
    """
    requested_role = ROLE_MAP.get(user_data.role_id, PUBLIC_REGISTRATION_ROLE)
    if requested_role != PUBLIC_REGISTRATION_ROLE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Public registration cannot create privileged accounts",
        )

    existing = db.execute(
        text("SELECT id FROM users WHERE username = :username"),
        {"username": user_data.username},
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered")

    if user_data.email:
        existing_email = db.execute(
            text("SELECT id FROM users WHERE email = :email"),
            {"email": user_data.email},
        ).first()
        if existing_email:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    db.execute(
        text(
            """
            INSERT INTO users (username, email, hashed_password, full_name, role, district, block, is_active)
            VALUES (:username, :email, :hashed_password, :full_name, :role, :district, :block, :is_active)
            """
        ),
        {
            "username": user_data.username,
            "email": user_data.email,
            "hashed_password": hash_password(user_data.password),
            "full_name": user_data.full_name,
            "role": PUBLIC_REGISTRATION_ROLE,
            "district": None,
            "block": None,
            "is_active": 1,
        },
    )
    db.commit()

    user = _fetch_user_by_username(db, user_data.username)
    access_token = create_access_token(data={"sub": user["username"]})
    return make_auth_response(_user_response(user), access_token)


@router.post("/login", response_model=AuthResponse)
@limiter.limit("5/minute")
def login(request: Request, credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate a user with username and password credentials.

    Args:
        request (Request): FastAPI request object used by the rate limiter.
        credentials (UserLogin): Validated login payload.
        db (Session): Request-scoped database session.

    Returns:
        dict: Sanitized user details.

    Raises:
        HTTPException: When credentials are invalid or the account is inactive.
    """
    user = _fetch_user_by_username(db, credentials.username)
    if user is None or not _active_user(user) or not _password_matches(credentials.password, user["hashed_password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    access_token = create_access_token(data={"sub": user["username"]})
    return make_auth_response(_user_response(user), access_token)


@router.post("/logout")
def logout():
    return make_logout_response()


@router.get("/me", response_model=dict)
def get_current_user_info(current_user=Depends(get_current_user)):
    """
    Return the sanitized profile for the authenticated session.

    Args:
        current_user: User mapping resolved by ``get_current_user``.

    Returns:
        dict: Non-secret user details for frontend session hydration.
    """
    return _user_response(current_user)


def _update_current_officer_details(
    request: UpdateOfficerDetailsRequest,
    current_user,
    db: Session,
    officer_label: str,
):
    """
    Update editable profile details on the current user's existing users row.

    This helper intentionally does not create or alter schema. If a deployment
    does not have users.mobile, callers get a clear validation error instead of
    an implicit schema change.
    """
    email = str(request.email) if request.email is not None else None

    if email:
        existing_email_user = db.execute(
            text(
                """
                SELECT id
                FROM users
                WHERE LOWER(email) = LOWER(:email)
                  AND id <> :id
                LIMIT 1
                """
            ),
            {"email": email, "id": current_user["id"]},
        ).first()
        if existing_email_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already assigned to another user",
            )

    set_clauses = [
        "full_name = :full_name",
        "email = :email",
    ]
    update_values = {
        "id": current_user["id"],
        "full_name": request.full_name,
        "email": email,
    }

    if _users_table_has_column(db, "mobile"):
        set_clauses.insert(1, "mobile = :mobile")
        update_values["mobile"] = request.mobile
    elif request.mobile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mobile cannot be updated because users.mobile is not available",
        )

    try:
        updated_user = db.execute(
            text(
                f"""
                UPDATE users
                SET {', '.join(set_clauses)}
                WHERE id = :id
                RETURNING id
                """
            ),
            update_values,
        ).mappings().first()
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already assigned to another user",
        ) from exc

    if updated_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"{officer_label} not found")

    user = _fetch_user_by_id(db, current_user["id"])
    return {
        "message": f"{officer_label} details updated successfully",
        "user": _user_response(user),
    }


@router.get("/district/officer-details", response_model=dict)
def get_district_officer_details(current_user=Depends(require_role("district"))):
    """
    Return editable profile details for the logged-in district officer.

    The user id comes from the authenticated session, so callers cannot fetch
    another officer's profile by changing request parameters.
    """
    return {"user": _user_response(current_user)}


@router.put("/district/officer-details", response_model=dict)
def update_district_officer_details(
    request: UpdateOfficerDetailsRequest,
    current_user=Depends(require_role("district")),
    db: Session = Depends(get_db),
):
    """
    Update editable profile details for the logged-in district officer.

    Only the current user's row is updated; no new table or column is created.
    """
    return _update_current_officer_details(
        request,
        current_user,
        db,
        "District officer",
    )


@router.get("/block/officer-details", response_model=dict)
def get_block_officer_details(current_user=Depends(require_role("block"))):
    """
    Return editable profile details for the logged-in block officer.

    The user id comes from the authenticated session, so callers cannot fetch
    another officer's profile by changing request parameters.
    """
    return {"user": _user_response(current_user)}


@router.put("/block/officer-details", response_model=dict)
def update_block_officer_details(
    request: UpdateBlockOfficerDetailsRequest,
    current_user=Depends(require_role("block")),
    db: Session = Depends(get_db),
):
    """
    Update editable profile details for the logged-in block officer.

    Only the current user's row is updated, and role/scope are resolved through
    the existing session dependency.
    """
    return _update_current_officer_details(
        request,
        current_user,
        db,
        "Block officer",
    )


@router.get("/admin/users")
def get_all_users(current_user=Depends(require_role("admin")), db: Session = Depends(get_db)):
    """
    List users for admin review and role management.

    Args:
        current_user: Admin user resolved by role dependency.
        db (Session): Request-scoped database session.

    Returns:
        list[dict]: Up to 100 sanitized user records with active status.
    """
    result = db.execute(
        text(
            """
            SELECT id, username, email, full_name, role, district, block, is_active
            FROM users
            ORDER BY id ASC
            LIMIT 100
            """
        )
    ).mappings().all()
    return [_user_response(user) | {"is_active": user["is_active"]} for user in result]


@router.get("/admin/users/{user_id}")
def get_user_by_id(user_id: int, current_user=Depends(require_role("admin")), db: Session = Depends(get_db)):
    """
    Fetch a single user for admin review.

    Args:
        user_id (int): User primary key.
        current_user: Admin user resolved by role dependency.
        db (Session): Request-scoped database session.

    Returns:
        dict: Sanitized user record with active status.

    Raises:
        HTTPException: When the target user does not exist.
    """
    user = _fetch_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return _user_response(user) | {"is_active": user["is_active"]}


@router.put("/admin/users/{user_id}/role")
def update_user_role(
    user_id: int,
    request: UpdateUserRoleRequest,
    current_user=Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    """
    Update another user's role from the admin console.

    Args:
        user_id (int): Target user primary key.
        request (UpdateUserRoleRequest): Validated role update payload.
        current_user: Admin user resolved by role dependency.
        db (Session): Request-scoped database session.

    Returns:
        dict: Confirmation message and assigned role.

    Raises:
        HTTPException: When admins attempt self-demotion or target user is
            missing.
    """
    if current_user["id"] == user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot modify your own role")

    target_user = _fetch_user_by_id(db, user_id)
    if target_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    try:
        request.validate_role_scope()
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    update_values = {"role": request.new_role, "id": user_id}
    set_clauses = ["role = :role"]
    provided_fields = request.model_fields_set
    if "district" in provided_fields:
        update_values["district"] = request.district
        set_clauses.append("district = :district")
    if "block" in provided_fields:
        update_values["block"] = request.block
        set_clauses.append("block = :block")

    db.execute(
        text(f"UPDATE users SET {', '.join(set_clauses)} WHERE id = :id"),
        update_values,
    )
    db.commit()
    return {"message": "Role updated successfully", "new_role": request.new_role}


@router.get("/district/block-officers")
def get_district_block_officers(
    current_user=Depends(require_role("district")),
    db: Session = Depends(get_db),
):
    """
    List block officer users assigned to the logged-in district officer's district.

    The response intentionally omits auth fields such as username, email, role,
    password/hash, and active state.
    """
    result = db.execute(
        text(
            f"""
            SELECT id, full_name, COALESCE(to_jsonb(u) ->> 'mobile', '') AS mobile, district, block
            FROM users AS u
            WHERE district = :district
              AND {BLOCK_OFFICER_ROLE_SQL_WITH_ALIAS}
            ORDER BY full_name ASC NULLS LAST, id ASC
            """
        ),
        {"district": current_user["district"]},
    )
    return {"users": [_block_officer_response(user) for user in result.mappings().all()]}


@router.put("/district/block-officers/{user_id}")
def update_district_block_officer(
    user_id: int,
    request: UpdateBlockOfficerRequest,
    current_user=Depends(require_role("district")),
    db: Session = Depends(get_db),
):
    """
    Update only district-managed editable fields for a block officer user.

    The update is constrained by both target user id and the logged-in district
    officer's district to prevent cross-district edits.
    """
    set_clauses = ["full_name = :full_name", "block = :block"]
    update_values = {
        "id": user_id,
        "district": current_user["district"],
        "full_name": request.full_name,
        "block": request.block,
    }

    if "mobile" in request.model_fields_set:
        if not _users_table_has_column(db, "mobile"):
            if request.mobile is not None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Mobile cannot be updated because users.mobile is not available",
                )
        else:
            set_clauses.append("mobile = :mobile")
            update_values["mobile"] = request.mobile

    updated_user = db.execute(
        text(
            f"""
            UPDATE users
            SET {', '.join(set_clauses)}
            WHERE id = :id
              AND district = :district
              AND {BLOCK_OFFICER_ROLE_SQL}
            RETURNING id
            """
        ),
        update_values,
    ).mappings().first()

    if updated_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Block officer not found in your district",
        )

    db.commit()
    user = _fetch_district_block_officer(db, user_id, current_user["district"])
    return {
        "message": "Block officer updated successfully",
        "user": _block_officer_response(user),
    }


@router.get("/district/users")
def get_district_users(
    limit: int = 50,
    offset: int = 0,
    current_user=Depends(require_role("admin", "district")),
    db: Session = Depends(get_db),
):
    """
    List users visible to admin or district officers.

    District officers are scoped to users within their assigned district, while
    admins can view the broader user list.

    Args:
        limit (int): Requested page size, capped at 100.
        offset (int): Pagination offset, normalized to zero or greater.
        current_user: Authorized admin or district officer.
        db (Session): Request-scoped database session.

    Returns:
        list[dict]: Sanitized user records with active status.
    """
    limit = min(max(limit, 1), 100)
    offset = max(offset, 0)
    current_role = _normalize_role(current_user.get("role"))

    if current_role == "admin":
        result = db.execute(
            text(
                """
                SELECT id, username, email, full_name, role, district, block, is_active
                FROM users
                ORDER BY id ASC
                LIMIT :limit OFFSET :offset
                """
            ),
            {"limit": limit, "offset": offset},
        )
    else:
        result = db.execute(
            text(
                """
                SELECT id, username, email, full_name, role, district, block, is_active
                FROM users
                WHERE district = :district AND LOWER(CAST(role AS TEXT)) IN ('block', 'farmer')
                ORDER BY id ASC
                LIMIT :limit OFFSET :offset
                """
            ),
            {"district": current_user["district"], "limit": limit, "offset": offset},
        )

    return [_user_response(user) | {"is_active": user["is_active"]} for user in result.mappings().all()]


@router.get("/block/users")
def get_block_users(
    limit: int = 50,
    offset: int = 0,
    current_user=Depends(require_role("admin", "district", "block")),
    db: Session = Depends(get_db),
):
    """
    List users visible to admin, district, or block officers.

    Block officers can only see farmer accounts for their own district and
    block, supporting least-privilege access to local records.

    Args:
        limit (int): Requested page size, capped at 100.
        offset (int): Pagination offset, normalized to zero or greater.
        current_user: Authorized admin, district officer, or block officer.
        db (Session): Request-scoped database session.

    Returns:
        list[dict]: Sanitized user records with active status.
    """
    limit = min(max(limit, 1), 100)
    offset = max(offset, 0)
    current_role = _normalize_role(current_user.get("role"))

    if current_role == "admin":
        result = db.execute(
            text(
                """
                SELECT id, username, email, full_name, role, district, block, is_active
                FROM users
                ORDER BY id ASC
                LIMIT :limit OFFSET :offset
                """
            ),
            {"limit": limit, "offset": offset},
        )
    elif current_role == "district":
        result = db.execute(
            text(
                """
                SELECT id, username, email, full_name, role, district, block, is_active
                FROM users
                WHERE district = :district AND LOWER(CAST(role AS TEXT)) IN ('block', 'farmer')
                ORDER BY id ASC
                LIMIT :limit OFFSET :offset
                """
            ),
            {"district": current_user["district"], "limit": limit, "offset": offset},
        )
    else:
        result = db.execute(
            text(
                """
                SELECT id, username, email, full_name, role, district, block, is_active
                FROM users
                WHERE district = :district AND block = :block AND LOWER(CAST(role AS TEXT)) = 'farmer'
                ORDER BY id ASC
                LIMIT :limit OFFSET :offset
                """
            ),
            {
                "district": current_user["district"],
                "block": current_user["block"],
                "limit": limit,
                "offset": offset,
            },
        )

    return [_user_response(user) | {"is_active": user["is_active"]} for user in result.mappings().all()]
