from sqlalchemy import Column, Integer, Numeric, BigInteger, DateTime
from ..database import Base


class Production(Base):
    __tablename__ = "production"

    id = Column(BigInteger, primary_key=True, index=True)

    district_id = Column(BigInteger, nullable=True)
    block_id = Column(BigInteger, nullable=True)
    millet_id = Column(BigInteger, nullable=True)
    season_id = Column(BigInteger, nullable=True)

    year = Column(Integer, nullable=True)
    area_hectare = Column(Numeric, nullable=True)
    production_ton = Column(Numeric, nullable=True)
    created_at = Column(DateTime, nullable=True)