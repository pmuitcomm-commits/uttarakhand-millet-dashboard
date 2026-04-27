"""
User model definitions for role-based access in the Millet MIS.

The users table supports administrative, district, block, and farmer personas
used by the dashboard and protected API routes.
"""

from sqlalchemy import Column, Integer, String, Enum
from enum import Enum as PyEnum
from ..database import Base


class UserRole(PyEnum):
    """Supported authorization roles for dashboard and API access."""

    ADMIN = "admin"
    DISTRICT_OFFICER = "district_officer"
    BLOCK_OFFICER = "block_officer"
    FARMER = "farmer"


class User(Base):
    """
    SQLAlchemy model for authenticated MIS users.

    District and block assignments are security-sensitive scope fields used to
    limit officer access to farmer records and regional dashboards.
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String)
    full_name = Column(String, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.FARMER, index=True)
    district = Column(String, nullable=True)  # District-level access scope.
    block = Column(String, nullable=True)  # Block-level access scope.
    is_active = Column(Integer, default=1)  # 1 = active, 0 = inactive.
