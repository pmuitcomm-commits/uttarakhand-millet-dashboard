from sqlalchemy import Column, Integer, String, Float
from ..database import Base


class Procurement(Base):

    __tablename__ = "procurement"

    s_no = Column(Integer, primary_key=True, index=True, name="S.no")

    district = Column(String, name="District")
    crop = Column(String, name="Crop")
    nos_of_centre = Column(Integer, name="Nos.of Centre")
    target_in_mt = Column(Float, name="Target (in MT)")
    no_of_farmers_shgs = Column(Integer, name="No. of Farmer's /SHGs")
    procurement_quantity_in_mt = Column(Float, name="Procurement quantity (in MT)")
    procurement_in_percent = Column(Float, name="Procurement (in %)")
    procurement_by_pvt_agencies_in_mt = Column(Float, name="Procurement by Pvt. agencies (in MT)")