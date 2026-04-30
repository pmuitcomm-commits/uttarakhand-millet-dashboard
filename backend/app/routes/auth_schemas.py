"""
Pydantic schemas and validation helpers for authentication routes.
"""

import re
from typing import Optional

from pydantic import BaseModel, EmailStr, field_validator

from .auth_roles import OFFICER_ROLES, ROLE_MAP, canonical_role_value


def validate_password_strength(password: str) -> bool:
    """Validate the minimum password policy for public account creation."""
    if len(password) < 8:
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"[a-z]", password):
        return False
    if not re.search(r"\d", password):
        return False
    return True


class UserRegister(BaseModel):
    """Pydantic schema for public account registration."""

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
    """Pydantic schema for username and password login requests."""

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
    """Request body for admin-only role updates."""

    new_role: str
    district: Optional[str] = None
    block: Optional[str] = None

    @field_validator("new_role")
    @classmethod
    def validate_new_role(cls, value: str) -> str:
        value = canonical_role_value(value.strip())
        if value not in OFFICER_ROLES:
            raise ValueError(f"Invalid role. Allowed roles: {sorted(OFFICER_ROLES)}")
        return value

    @field_validator("district", "block", mode="before")
    @classmethod
    def validate_optional_scope(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        value = str(value).strip()
        return value or None

    def validate_role_scope(self) -> None:
        """Validate geographic scope required by officer roles."""
        if self.new_role == "district" and not self.district:
            raise ValueError("District is required for district officer role")
        if self.new_role == "block":
            if not self.district and not self.block:
                raise ValueError("District and block are required for block officer role")
            if not self.district:
                raise ValueError("District is required for block officer role")
            if not self.block:
                raise ValueError("Block is required for block officer role")


class AuthResponse(BaseModel):
    """Response contract returned after successful authentication."""

    user: dict
