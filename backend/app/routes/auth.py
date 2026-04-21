import re
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy import text
from sqlalchemy.orm import Session

from ..database import get_db
from ..rate_limit import limiter
from ..security import create_access_token, decode_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()

ROLE_MAP = {
    1: "admin",
    2: "district_officer",
    3: "block_officer",
    4: "farmer",
}

ROLE_ID_MAP = {role: role_id for role_id, role in ROLE_MAP.items()}
PUBLIC_REGISTRATION_ROLE = "farmer"


def validate_password_strength(password: str) -> bool:
    if len(password) < 8:
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"[a-z]", password):
        return False
    if not re.search(r"\d", password):
        return False
    return True


def _normalize_role(role_value) -> str:
    if role_value is None:
        return PUBLIC_REGISTRATION_ROLE
    if hasattr(role_value, "value"):
        role_value = role_value.value
    role = str(role_value).split(".")[-1].lower()
    return role if role in ROLE_ID_MAP else PUBLIC_REGISTRATION_ROLE


def _active_user(user) -> bool:
    try:
        return int(user.get("is_active") or 0) == 1
    except (TypeError, ValueError):
        return False


def _user_response(user) -> dict:
    return {
        "id": user["id"],
        "username": user["username"],
        "email": user.get("email"),
        "full_name": user.get("full_name"),
        "role": _normalize_role(user.get("role")),
        "district": user.get("district"),
        "block": user.get("block"),
    }


def _fetch_user_by_username(db: Session, username: str):
    return db.execute(
        text(
            """
            SELECT id, username, email, hashed_password, full_name, role, district, block, is_active
            FROM users
            WHERE username = :username
            LIMIT 1
            """
        ),
        {"username": username},
    ).mappings().first()


def _fetch_user_by_id(db: Session, user_id: int):
    return db.execute(
        text(
            """
            SELECT id, username, email, full_name, role, district, block, is_active
            FROM users
            WHERE id = :id
            LIMIT 1
            """
        ),
        {"id": user_id},
    ).mappings().first()


def _validate_scope_fields(user):
    role = _normalize_role(user.get("role"))
    if role in {"district_officer", "block_officer"} and not user.get("district"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is missing district assignment",
        )
    if role == "block_officer" and not user.get("block"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is missing block assignment",
        )


class UserRegister(BaseModel):
    username: str
    password: str
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role_id: Optional[int] = None

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 3 or len(value) > 50:
            raise ValueError("Username must be between 3 and 50 characters")
        if not re.match(r"^[a-zA-Z0-9_-]+$", value):
            raise ValueError("Username can only contain alphanumeric characters, underscores, and hyphens")
        return value

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if not validate_password_strength(value):
            raise ValueError("Password must be at least 8 characters and contain uppercase, lowercase, and digits")
        return value

    @field_validator("role_id")
    @classmethod
    def validate_role_id(cls, value: Optional[int]) -> Optional[int]:
        if value is not None and value not in ROLE_MAP:
            raise ValueError(f"Invalid role_id. Allowed values: {list(ROLE_MAP.keys())}")
        return value

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        value = value.strip()
        if len(value) < 1 or len(value) > 100:
            raise ValueError("Full name must be between 1 and 100 characters")
        return value


class UserLogin(BaseModel):
    username: str
    password: str

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Username is required")
        return value


class UpdateUserRoleRequest(BaseModel):
    new_role: str

    @field_validator("new_role")
    @classmethod
    def validate_new_role(cls, value: str) -> str:
        value = value.lower().strip()
        if value not in ROLE_ID_MAP:
            raise ValueError(f"Invalid role. Allowed roles: {list(ROLE_ID_MAP.keys())}")
        return value


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    payload = decode_token(credentials.credentials)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    username = payload.get("sub")
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = _fetch_user_by_username(db, username)
    if user is None or not _active_user(user):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def require_role(*allowed_roles):
    allowed_role_names = {
        ROLE_MAP.get(role, role) if isinstance(role, int) else role
        for role in allowed_roles
    }

    async def check_role(current_user=Depends(get_current_user)):
        current_role = _normalize_role(current_user.get("role"))
        if current_role not in allowed_role_names:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This action requires one of the following roles: {', '.join(sorted(allowed_role_names))}",
            )
        _validate_scope_fields(current_user)
        return current_user

    return check_role


@router.post("/register", response_model=TokenResponse)
@limiter.limit("10/minute")
def register(request: Request, user_data: UserRegister, db: Session = Depends(get_db)):
    """Public registration creates only low-privilege farmer accounts."""
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
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": _user_response(user),
    }


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
def login(request: Request, credentials: UserLogin, db: Session = Depends(get_db)):
    user = _fetch_user_by_username(db, credentials.username)
    if user is None or not _active_user(user) or not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    access_token = create_access_token(data={"sub": user["username"]})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": _user_response(user),
    }


@router.get("/me", response_model=dict)
def get_current_user_info(current_user=Depends(get_current_user)):
    return _user_response(current_user)


@router.get("/admin/users")
def get_all_users(current_user=Depends(require_role("admin")), db: Session = Depends(get_db)):
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
    if current_user["id"] == user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot modify your own role")

    target_user = _fetch_user_by_id(db, user_id)
    if target_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    db.execute(
        text("UPDATE users SET role = :role WHERE id = :id"),
        {"role": request.new_role, "id": user_id},
    )
    db.commit()
    return {"message": "Role updated successfully", "new_role": request.new_role}


@router.get("/district/users")
def get_district_users(
    limit: int = 50,
    offset: int = 0,
    current_user=Depends(require_role("admin", "district_officer")),
    db: Session = Depends(get_db),
):
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
                WHERE district = :district AND LOWER(CAST(role AS TEXT)) IN ('block_officer', 'farmer')
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
    current_user=Depends(require_role("admin", "district_officer", "block_officer")),
    db: Session = Depends(get_db),
):
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
    elif current_role == "district_officer":
        result = db.execute(
            text(
                """
                SELECT id, username, email, full_name, role, district, block, is_active
                FROM users
                WHERE district = :district AND LOWER(CAST(role AS TEXT)) IN ('block_officer', 'farmer')
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
