from sqlalchemy import Column, Integer, String, Enum
from enum import Enum as PyEnum
from ..database import Base


class UserRole(PyEnum):
    ADMIN = "admin"
    DISTRICT_OFFICER = "district_officer"
    BLOCK_OFFICER = "block_officer"
    FARMER = "farmer"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String)
    full_name = Column(String, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.FARMER, index=True)
    district = Column(String, nullable=True)  # For district officers
    block = Column(String, nullable=True)  # For block officers
    is_active = Column(Integer, default=1)  # 1 = active, 0 = inactive
