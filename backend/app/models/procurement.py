from sqlalchemy import Column, Integer, String, Float, BigInteger
from ..database import Base


class Procurement(Base):
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