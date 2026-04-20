from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import String, bindparam, text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from ..database import get_db

router = APIRouter()


class FarmerCreate(BaseModel):
    name: str
    father_husband_name: Optional[str] = None
    mobile: str = Field(min_length=10, max_length=10)
    email: Optional[str] = None
    address: str
    group_president_name: Optional[str] = None
    bank_account_number: str
    bank_ifsc: str
    bank_name_address: str
    district_name: str
    block_name: str
    account_holder_name: str
    crops: List[str]
    estimated_seed_date: date
    estimated_yield: Optional[str] = None


class LandParcelCreate(BaseModel):
    khatauni_number: str
    khasra_number: str
    area_value: float
    area_unit: str
    ownership_type: str
    cultivator_name: Optional[str] = None
    lease_period: Optional[str] = None


class FarmerRegistrationRequest(BaseModel):
    farmer: FarmerCreate
    land_parcels: List[LandParcelCreate]


def _validate_mobile(mobile: str) -> str:
    cleaned_mobile = mobile.strip()
    if not cleaned_mobile.isdigit() or len(cleaned_mobile) != 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mobile number must be exactly 10 digits",
        )
    return cleaned_mobile


def _serialize_value(value):
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    return value


def _serialize_mapping(row) -> dict:
    return {key: _serialize_value(value) for key, value in row.items()}


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_farmer(
    payload: FarmerRegistrationRequest,
    db: Session = Depends(get_db),
):
    farmer_data = payload.farmer.model_dump()
    farmer_data["mobile"] = _validate_mobile(farmer_data["mobile"])
    farmer_data["bank_ifsc"] = farmer_data["bank_ifsc"].strip().upper()

    insert_farmer_query = text(
        """
        INSERT INTO farmers (
            name,
            father_husband_name,
            mobile,
            email,
            address,
            group_president_name,
            bank_account_number,
            bank_ifsc,
            bank_name_address,
            district_name,
            block_name,
            account_holder_name,
            crops,
            estimated_seed_date,
            estimated_yield
        )
        VALUES (
            :name,
            :father_husband_name,
            :mobile,
            :email,
            :address,
            :group_president_name,
            :bank_account_number,
            :bank_ifsc,
            :bank_name_address,
            :district_name,
            :block_name,
            :account_holder_name,
            :crops,
            :estimated_seed_date,
            :estimated_yield
        )
        RETURNING farmer_id
        """
    ).bindparams(bindparam("crops", type_=ARRAY(String)))

    insert_land_query = text(
        """
        INSERT INTO land_parcels (
            farmer_id,
            khatauni_number,
            khasra_number,
            area_value,
            area_unit,
            ownership_type,
            cultivator_name,
            lease_period
        )
        VALUES (
            :farmer_id,
            :khatauni_number,
            :khasra_number,
            :area_value,
            :area_unit,
            :ownership_type,
            :cultivator_name,
            :lease_period
        )
        """
    )

    try:
        farmer_id = db.execute(insert_farmer_query, farmer_data).scalar_one()

        for parcel in payload.land_parcels:
            parcel_data = parcel.model_dump()
            parcel_data["farmer_id"] = farmer_id
            db.execute(insert_land_query, parcel_data)

        db.commit()
        return {
            "message": "Farmer registered successfully",
            "farmer_id": farmer_id,
        }
    except IntegrityError as exc:
        db.rollback()
        detail = "Farmer registration failed"
        if "mobile" in str(exc.orig).lower():
            detail = "A farmer with this mobile number already exists"
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail) from exc
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
        ) from exc
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register farmer",
        ) from exc


@router.get("/status/{mobile}")
def check_enrollment_status(
    mobile: str,
    db: Session = Depends(get_db),
):
    validated_mobile = _validate_mobile(mobile)

    farmer_query = text(
        """
        SELECT
            farmer_id,
            name,
            father_husband_name,
            mobile,
            email,
            address,
            group_president_name,
            bank_account_number,
            bank_ifsc,
            bank_name_address,
            district_name,
            block_name,
            account_holder_name,
            crops,
            estimated_seed_date,
            estimated_yield,
            created_at
        FROM farmers
        WHERE mobile = :mobile
        LIMIT 1
        """
    )

    land_query = text(
        """
        SELECT
            land_id,
            farmer_id,
            khatauni_number,
            khasra_number,
            area_value,
            area_unit,
            ownership_type,
            cultivator_name,
            lease_period,
            created_at
        FROM land_parcels
        WHERE farmer_id = :farmer_id
        ORDER BY land_id ASC
        """
    )

    try:
        farmer_row = db.execute(
            farmer_query,
            {"mobile": validated_mobile},
        ).mappings().first()

        if farmer_row is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No enrollment found for this mobile number",
            )

        land_rows = db.execute(
            land_query,
            {"farmer_id": farmer_row["farmer_id"]},
        ).mappings().all()

        return {
            "farmer": _serialize_mapping(farmer_row),
            "land_parcels": [_serialize_mapping(row) for row in land_rows],
        }
    except HTTPException:
        raise
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch enrollment status",
        ) from exc
