"""
Production model for district, crop, season, and year-wise millet output.

Records from this table feed dashboard KPIs, district charts, millet charts,
and production data tables used for scheme monitoring.
"""

from sqlalchemy import Column, Integer, Numeric, BigInteger, DateTime
from ..database import Base


class Production(Base):
    """SQLAlchemy mapping for the production reporting table."""

    __tablename__ = "millet_production"

    id = Column(BigInteger, primary_key=True, index=True)

    # Foreign-key style identifiers mirror the source MIS lookup tables.
    district_id = Column(BigInteger, nullable=True)
    block_id = Column(BigInteger, nullable=True)
    millet_id = Column(BigInteger, nullable=True)
    season_id = Column(BigInteger, nullable=True)

    year = Column(Integer, nullable=True)
    area_hectare = Column(Numeric, nullable=True)
    production_ton = Column(Numeric, nullable=True)
    created_at = Column(DateTime, nullable=True)
