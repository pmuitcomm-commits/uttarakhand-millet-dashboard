"""
District and block data-entry model for officer-entered MIS rows.

The table is additive and stores flexible metric rows entered from the
district/block Excel-like pages without modifying existing reporting tables.
"""

from sqlalchemy import Column, DateTime, Integer, String, func

from ..database import Base


class DistrictBlockDataEntry(Base):
    """SQLAlchemy mapping for officer-entered district/block metric rows."""

    __tablename__ = "district_block_data_entries"

    id = Column(Integer, primary_key=True, index=True)
    scope_type = Column(String(20), nullable=False, index=True)
    district = Column(String(120), nullable=False, index=True)
    block = Column(String(120), nullable=True, index=True)
    data_type = Column(String(120), nullable=True)
    metric_name = Column(String(240), nullable=False)
    value = Column(String(120), nullable=True)
    unit = Column(String(80), nullable=True)
    reporting_period = Column(String(120), nullable=True)
    remarks = Column(String(500), nullable=True)
    created_by = Column(Integer, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
