from sqlalchemy import Column, Integer, String, Float
from ..database import Base


class MilletProduction(Base):

    __tablename__ = "millet_production"

    id = Column(Integer, primary_key=True, index=True)

    district = Column(String)
    block = Column(String)
    village = Column(String)
    millet_type = Column(String)

    production_quintal = Column(Float)
    year = Column(Integer)
    farmer_count = Column(Integer)