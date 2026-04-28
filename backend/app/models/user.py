"""
User model definitions for role-based access in the Millet MIS.

The users table stores role values as lowercase strings in the existing
Supabase schema.
"""

from sqlalchemy import Column, Integer, String
from ..database import Base


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
    role = Column(String, default="farmer", index=True)
    district = Column(String, nullable=True)  # District-level access scope.
    block = Column(String, nullable=True)  # Block-level access scope.
    is_active = Column(Integer, default=1)  # 1 = active, 0 = inactive.
