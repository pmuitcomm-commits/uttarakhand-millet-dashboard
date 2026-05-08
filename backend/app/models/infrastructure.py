"""Infrastructure and processing master data models."""

from sqlalchemy import BigInteger, Column, DateTime, Numeric, String, func

from ..database import Base


class StorageProcessing(Base):
    """Storage, processing, and infrastructure master records."""

    __tablename__ = "storage_processing"

    id = Column(BigInteger, primary_key=True, autoincrement=True, index=True)
    district = Column(String(120), index=True, nullable=True)
    block = Column(String(120), index=True, nullable=True)
    facility_name = Column(String(200), nullable=False)
    facility_type = Column(String(80), index=True, nullable=True)
    capacity_mt = Column(Numeric, nullable=True)
    operational_status = Column(String(80), index=True, nullable=True)
    remarks = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)

