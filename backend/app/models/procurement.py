"""
Procurement model for millet purchase targets, centers, and achievement data.

The procurement table supports the public procurement dashboard and KPI
aggregation used by state and district monitoring teams.
"""

from sqlalchemy import Column, Integer, String, Float, BigInteger
from ..database import Base


class Procurement(Base):
    """SQLAlchemy mapping for district and crop-wise procurement records."""

    __tablename__ = "procurement"

    id = Column(BigInteger, primary_key=True, index=True)

    district = Column(String, nullable=True)
    crop = Column(String, nullable=True)

    centres = Column(Integer, nullable=True)
    target_mt = Column(Float, nullable=True)
    farmers_count = Column(Integer, nullable=True)

    procurement_mt = Column(Float, nullable=True)
    procurement_percent = Column(Float, nullable=True)
    private_procurement_mt = Column(Float, nullable=True)

    district_id = Column(BigInteger, nullable=True)
    millet_id = Column(BigInteger, nullable=True)
