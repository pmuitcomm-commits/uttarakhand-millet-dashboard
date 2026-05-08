"""
Farmer enrollment table models used for reproducible fresh database setup.

These models intentionally mirror only the columns read and written by
``app.routes.farmer``. They are registered with SQLAlchemy metadata so
``Base.metadata.create_all`` can create missing tables on a fresh Supabase
database without altering existing tables.

TODO: Compare these nullable column definitions with the live Supabase schema
before introducing migrations. The live schema remains the source of truth.
"""

from sqlalchemy import BigInteger, Boolean, Column, Date, DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.dialects.postgresql import ARRAY

from ..database import Base


class Farmer(Base):
    """SQLAlchemy mapping for public farmer enrollment records."""

    __tablename__ = "farmers"

    id = Column(BigInteger, primary_key=True, autoincrement=True, index=True)
    farmer_id = Column(BigInteger, unique=True, index=True, nullable=True)
    farmer_code = Column(String(120), unique=True, index=True, nullable=True)

    name = Column(String(100), nullable=False)
    father_husband_name = Column(String(100), nullable=True)
    mobile = Column(String(10), unique=True, index=True, nullable=True)
    email = Column(String(255), nullable=True)
    address = Column(String(300), nullable=True)
    group_president_name = Column(String(100), nullable=True)

    bank_account_number = Column(String(18), nullable=True)
    bank_ifsc = Column(String(11), nullable=True)
    bank_name_address = Column(String(200), nullable=True)
    account_holder_name = Column(String(100), nullable=True)

    district = Column(String(100), index=True, nullable=True)
    block = Column(String(100), index=True, nullable=True)
    village = Column(String(160), nullable=True)
    district_name = Column(String(100), index=True, nullable=True)
    block_name = Column(String(100), index=True, nullable=True)
    crops = Column(ARRAY(String), nullable=True)
    estimated_seed_date = Column(Date, nullable=True)
    estimated_yield = Column(String(50), nullable=True)

    consent_accepted = Column(Boolean, nullable=False, default=False)
    consent_text_version = Column(String(50), nullable=True)
    consent_accepted_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)


class FarmerSchemeTransaction(Base):
    """Unified farmer-level scheme and incentive transaction table."""

    __tablename__ = "farmer_scheme_transactions"

    id = Column(BigInteger, primary_key=True, autoincrement=True, index=True)
    farmer_id = Column(BigInteger, ForeignKey("farmers.id"), index=True, nullable=False)
    scheme_type = Column(String(40), index=True, nullable=False)

    millet_type = Column(String(120), nullable=True)
    quantity = Column(Numeric, nullable=True)
    area_ha = Column(Numeric, nullable=True)
    no_of_items = Column(Integer, nullable=True)
    production = Column(Numeric, nullable=True)
    type_of_sowing = Column(String(120), nullable=True)
    incentive = Column(Numeric, nullable=True)
    award = Column(Numeric, nullable=True)
    transaction_date = Column(Date, index=True, nullable=True)
    remarks = Column(String(500), nullable=True)

    # Audit columns retain migration traceability while the legacy tables are
    # kept as a rollback/archive source during the incremental cutover.
    source_table = Column(String(120), nullable=True)
    source_record_key = Column(String(160), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)


class LandParcel(Base):
    """SQLAlchemy mapping for land parcels attached to a farmer enrollment."""

    __tablename__ = "land_parcels"

    land_id = Column(BigInteger, primary_key=True, autoincrement=True, index=True)
    farmer_id = Column(BigInteger, index=True, nullable=True)

    khatauni_number = Column(String(50), nullable=True)
    khasra_number = Column(String(50), nullable=True)
    area_value = Column(Numeric, nullable=True)
    area_unit = Column(String(20), nullable=True)
    ownership_type = Column(String(20), nullable=True)
    cultivator_name = Column(String(100), nullable=True)
    lease_period = Column(String(50), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)
