from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
import re

from ..database import get_db
from ..security import hash_password, verify_password, create_access_token, decode_token

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()


class HTTPAuthCredentials:
    """Custom HTTP Auth Credentials for Bearer token"""
    def __init__(self, scheme: str, credentials: str):
        self.scheme = scheme
        self.credentials = credentials


# Password validation function
def validate_password_strength(password: str) -> bool:
    """
    Validate password strength:
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    """
    if len(password) < 8:
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"[a-z]", password):
        return False
    if not re.search(r"\d", password):
        return False
    return True


# Pydantic Models
class UserRegister(BaseModel):
    username: str
    password: str
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role_id: int = 4  # Default to farmer (4)
    district: Optional[str] = None
    
    @field_validator('username')
    @classmethod
    def validate_username(cls, v: str) -> str:
        if len(v) < 3 or len(v) > 50:
            raise ValueError('Username must be between 3 and 50 characters')
        if not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise ValueError('Username can only contain alphanumeric characters, underscores, and hyphens')
        return v
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not validate_password_strength(v):
            raise ValueError(
                'Password must be at least 8 characters and contain uppercase, lowercase, and digits'
            )
        return v
    
    @field_validator('role_id')
    @classmethod
    def validate_role_id(cls, v: int) -> int:
        if v not in ROLE_ID_MAP.values():
            raise ValueError(f'Invalid role_id. Allowed values: {list(ROLE_ID_MAP.values())}')
        return v
    
    @field_validator('district')
    @classmethod
    def validate_district(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            if len(v) < 1 or len(v) > 100:
                raise ValueError('District must be between 1 and 100 characters')
            if not re.match(r'^[a-zA-Z0-9\s\-_.]*$', v):
                raise ValueError('District can only contain alphanumeric characters, spaces, hyphens, underscores, and dots')
        return v
    
    @field_validator('full_name')
    @classmethod
    def validate_full_name(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            if len(v) < 1 or len(v) > 100:
                raise ValueError('Full name must be between 1 and 100 characters')
        return v


class UserLogin(BaseModel):
    username: str
    password: str


class UpdateUserRoleRequest(BaseModel):
    """Pydantic model for role update with validation"""
    new_role: str
    
    @field_validator('new_role')
    @classmethod
    def validate_new_role(cls, v: str) -> str:
        if v.lower() not in ROLE_ID_MAP:
            raise ValueError(f'Invalid role. Allowed roles: {list(ROLE_ID_MAP.keys())}')
        return v.lower()


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict


class UserResponse(BaseModel):
    id: int
    name: str
    email: Optional[str]
    role_id: int
    district: Optional[str]


# Role mapping
ROLE_MAP = {
    1: "admin",
    2: "district_officer",
    3: "block_officer",
    4: "farmer"
}

ROLE_ID_MAP = {
    "admin": 1,
    "district_officer": 2,
    "block_officer": 3,
    "farmer": 4
}


# Helper function to get current user from token
async def get_current_user(credentials: HTTPAuthCredentials = Depends(security), db: Session = Depends(get_db)):
    """Get current authenticated user from JWT token"""
    token = credentials.credentials
    payload = decode_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    username: str = payload.get("sub")
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    result = db.execute(text("SELECT * FROM users WHERE username = :username"), {"username": username})
    user = result.first()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


def require_role(*allowed_role_ids):
    """Dependency to check if user has required role"""
    async def check_role(current_user = Depends(get_current_user)):
        if current_user[3] not in allowed_role_ids:  # role_id is at index 3
            role_names = [ROLE_MAP.get(rid, "unknown") for rid in allowed_role_ids]
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This action requires one of the following roles: {', '.join(role_names)}"
            )
        return current_user
    return check_role


# Routes

@router.post("/register", response_model=TokenResponse)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user (Rate limited by global limit: 60 req/min per IP)"""
    # Check if user already exists
    result = db.execute(text("SELECT id FROM users WHERE username = :username"), {"username": user_data.username})
    if result.first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Create new user
    hashed_password = hash_password(user_data.password)
    # Use role_id directly to get role name (no silent fallback)
    role_name = ROLE_MAP.get(user_data.role_id)
    if not role_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role_id {user_data.role_id}"
        )
    
    db.execute(text("""
        INSERT INTO users (username, email, hashed_password, full_name, role, district, block, is_active)
        VALUES (:username, :email, :hashed_password, :full_name, :role, :district, :block, :is_active)
    """), {
        "username": user_data.username,
        "email": user_data.email,
        "hashed_password": hashed_password,
        "full_name": user_data.full_name,
        "role": role_name,
        "district": user_data.district,
        "block": None,
        "is_active": 1
    })
    db.commit()
    
    # Fetch created user
    result = db.execute(text("SELECT id, username, email, role, district FROM users WHERE username = :username"),
                       {"username": user_data.username})
    user = result.first()
    
    # Create access token
    access_token = create_access_token(data={"sub": user[1]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user[0],
            "username": user[1],
            "email": user[2],
            "role": user[3],
            "district": user[4],
        }
    }


@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user with username and password - rate limited"""
    result = db.execute(text("SELECT id, username, email, hashed_password, role, district FROM users WHERE username = :username"), 
                       {"username": credentials.username})
    user = result.first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    # Verify password
    if not verify_password(credentials.password, user[3]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user[1]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user[0],
            "username": user[1],
            "email": user[2],
            "role": user[4],
            "district": user[5],
        }
    }


@router.get("/me", response_model=dict)
def get_current_user_info(current_user = Depends(get_current_user)):
    """Get current logged-in user info"""
    return {
        "id": current_user[0],
        "username": current_user[1],
        "email": current_user[2],
        "role": ROLE_MAP.get(current_user[3], "farmer"),
        "district": current_user[5] if len(current_user) > 5 else None,
    }


@router.get("/admin/users")
def get_all_users(current_user = Depends(require_role(1)), db: Session = Depends(get_db)):
    """Get all users (Admin only)"""
    result = db.execute(text("SELECT id, name, email, role_id, district FROM users LIMIT 100"))
    users = result.fetchall()
    
    return [
        {
            "id": u[0],
            "username": u[1],
            "email": u[2],
            "role": ROLE_MAP.get(u[3], "farmer"),
            "district": u[4]
        }
        for u in users
    ]


@router.get("/admin/users/{user_id}")
def get_user_by_id(user_id: int, current_user = Depends(require_role(1)), db: Session = Depends(get_db)):
    """Get specific user by ID (Admin only)"""
    result = db.execute(text("SELECT id, name, email, role_id, district FROM users WHERE id = :id"), 
                       {"id": user_id})
    user = result.first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": user[0],
        "username": user[1],
        "email": user[2],
        "role": ROLE_MAP.get(user[3], "farmer"),
        "district": user[4]
    }


@router.put("/admin/users/{user_id}/role")
def update_user_role(
    user_id: int,
    request: UpdateUserRoleRequest,
    current_user = Depends(require_role(1)),
    db: Session = Depends(get_db)
):
    """Update user role (Admin only)"""
    # Prevent admin from modifying their own role
    if current_user[0] == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify your own role"
        )
    
    # Check if target user exists
    result = db.execute(text("SELECT id FROM users WHERE id = :id"), {"id": user_id})
    if not result.first():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    role_id = ROLE_ID_MAP.get(request.new_role)
    if not role_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Allowed roles: {', '.join(ROLE_ID_MAP.keys())}"
        )
    
    db.execute(text("UPDATE users SET role = :role WHERE id = :id"), 
              {"role": request.new_role, "id": user_id})
    db.commit()
    
    return {"message": "Role updated successfully", "new_role": request.new_role}


@router.get("/district/users")
def get_district_users(
    limit: int = 50,
    offset: int = 0,
    current_user = Depends(require_role(1, 2)),
    db: Session = Depends(get_db)
):
    """
    Get users in district for management with pagination
    - Admin: can see all users
    - District Officer: can see and manage block officers and farmers in their district
    """
    # Validate pagination parameters
    if limit < 1 or limit > 100:
        limit = 50
    if offset < 0:
        offset = 0
    
    if current_user[3] == 1:  # Admin
        result = db.execute(text("SELECT id, name, email, role_id, district FROM users LIMIT :limit OFFSET :offset"),
                           {"limit": limit, "offset": offset})
    else:
        # District officer - get block officers (role_id=3) and farmers (role_id=4) from same district
        result = db.execute(text("""
            SELECT id, name, email, role_id, district FROM users 
            WHERE district = :district AND role_id > 1
            LIMIT :limit OFFSET :offset
        """), {"district": current_user[5], "limit": limit, "offset": offset})
    
    users = result.fetchall()
    return [
        {
            "id": u[0],
            "username": u[1],
            "email": u[2],
            "role": ROLE_MAP.get(u[3], "farmer"),
            "district": u[4]
        }
        for u in users
    ]


@router.get("/block/users")
def get_block_users(
    limit: int = 50,
    offset: int = 0,
    current_user = Depends(require_role(1, 2, 3)),
    db: Session = Depends(get_db)
):
    """
    Get users in block (read-only for Block Officer) with pagination
    - Admin: can see all users
    - District Officer: can see all users in their district
    - Block Officer: can only see farmers in their district (read-only, no management)
    """
    # Validate pagination parameters
    if limit < 1 or limit > 100:
        limit = 50
    if offset < 0:
        offset = 0
    
    if current_user[3] == 1:  # Admin
        result = db.execute(text("SELECT id, name, email, role_id, district FROM users LIMIT :limit OFFSET :offset"),
                           {"limit": limit, "offset": offset})
    elif current_user[3] == 2:  # District officer
        result = db.execute(text("""
            SELECT id, name, email, role_id, district FROM users 
            WHERE district = :district
            LIMIT :limit OFFSET :offset
        """), {"district": current_user[5], "limit": limit, "offset": offset})
    else:  # Block officer - read-only access to farmers only
        result = db.execute(text("""
            SELECT id, name, email, role_id, district FROM users 
            WHERE district = :district AND role_id = 4
            LIMIT :limit OFFSET :offset
        """), {"district": current_user[5], "limit": limit, "offset": offset})
    
    users = result.fetchall()
    return [
        {
            "id": u[0],
            "username": u[1],
            "email": u[2],
            "role": ROLE_MAP.get(u[3], "farmer"),
            "district": u[4]
        }
        for u in users
    ]
