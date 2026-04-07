from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from starlette.requests import Request
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel, EmailStr
from typing import Optional

from ..database import get_db
from ..security import hash_password, verify_password, create_access_token, decode_token

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()


class HTTPAuthCredentials:
    """Custom HTTP Auth Credentials for Bearer token"""
    def __init__(self, scheme: str, credentials: str):
        self.scheme = scheme
        self.credentials = credentials


# Pydantic Models
class UserRegister(BaseModel):
    username: str
    password: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    role_id: int = 4  # Default to farmer (4)
    district: Optional[str] = None


class UserLogin(BaseModel):
    username: str
    password: str


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
    
    result = db.execute(text("SELECT * FROM users WHERE name = :username"), {"username": username})
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
    """Register a new user"""
    # Check if user already exists
    result = db.execute(text("SELECT id FROM users WHERE name = :username"), {"username": user_data.username})
    if result.first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Create new user
    hashed_password = hash_password(user_data.password)
    db.execute(text("""
        INSERT INTO users (name, email, password, role_id, district, created_at)
        VALUES (:name, :email, :password, :role_id, :district, NOW())
    """), {
        "name": user_data.username,
        "email": user_data.email,
        "password": hashed_password,
        "role_id": user_data.role_id,
        "district": user_data.district
    })
    db.commit()
    
    # Fetch created user
    result = db.execute(text("SELECT id, name, email, role_id, district FROM users WHERE name = :username"), 
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
            "role": ROLE_MAP.get(user[3], "farmer"),
            "email": user[2],
            "district": user[4],
        }
    }


@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user with username and password"""
    result = db.execute(text("SELECT id, name, email, password, role_id, district FROM users WHERE name = :username"), 
                       {"username": credentials.username})
    user = result.first()
    
    if not user or not verify_password(credentials.password, user[3]):
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
            "role": ROLE_MAP.get(user[4], "farmer"),
            "email": user[2],
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
    new_role: str,
    current_user = Depends(require_role(1)),
    db: Session = Depends(get_db)
):
    """Update user role (Admin only)"""
    role_id = ROLE_ID_MAP.get(new_role.lower())
    if not role_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Allowed roles: {', '.join(ROLE_ID_MAP.keys())}"
        )
    
    db.execute(text("UPDATE users SET role_id = :role_id WHERE id = :id"), 
              {"role_id": role_id, "id": user_id})
    db.commit()
    
    return {"message": "Role updated successfully", "new_role": new_role}


@router.get("/district/users")
def get_district_users(
    current_user = Depends(require_role(1, 2)),
    db: Session = Depends(get_db)
):
    """
    Get users in district for management
    - Admin: can see all users
    - District Officer: can see and manage block officers and farmers in their district
    """
    if current_user[3] == 1:  # Admin
        result = db.execute(text("SELECT id, name, email, role_id, district FROM users LIMIT 100"))
    else:
        # District officer - get block officers (role_id=3) and farmers (role_id=4) from same district
        result = db.execute(text("""
            SELECT id, name, email, role_id, district FROM users 
            WHERE district = :district AND role_id > 1
        """), {"district": current_user[5]})
    
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
    current_user = Depends(require_role(1, 2, 3)),
    db: Session = Depends(get_db)
):
    """
    Get users in block (read-only for Block Officer)
    - Admin: can see all users
    - District Officer: can see all users in their district
    - Block Officer: can only see farmers in their district (read-only, no management)
    """
    if current_user[3] == 1:  # Admin
        result = db.execute(text("SELECT id, name, email, role_id, district FROM users LIMIT 100"))
    elif current_user[3] == 2:  # District officer
        result = db.execute(text("""
            SELECT id, name, email, role_id, district FROM users 
            WHERE district = :district
        """), {"district": current_user[5]})
    else:  # Block officer - read-only access to farmers only
        result = db.execute(text("""
            SELECT id, name, email, role_id, district FROM users 
            WHERE district = :district AND role_id = 4
        """), {"district": current_user[5]})
    
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
