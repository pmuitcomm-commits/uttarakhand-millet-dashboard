from datetime import date, datetime
from decimal import Decimal
import re
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr, Field, field_validator
from sqlalchemy import String, bindparam, text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from ..database import get_db
from ..rate_limit import limiter
from .auth import require_role

router = APIRouter()

NAME_PATTERN = re.compile(r"^[A-Za-z][A-Za-z .'-]{0,99}$")
TEXT_PATTERN = re.compile(r"^[A-Za-z0-9\s,./&()#:%'-]+$")
LAND_ID_PATTERN = re.compile(r"^[A-Za-z0-9/-]{1,50}$")
CROP_PATTERN = re.compile(r"^[A-Za-z][A-Za-z0-9\s-]{0,49}$")
IFSC_PATTERN = re.compile(r"^[A-Za-z]{4}0[A-Za-z0-9]{6}$")


def _clean_optional(value: Optional[str]) -> Optional[str]:
    if value is None:
        return value
    value = value.strip()
    return value or None


class FarmerCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    father_husband_name: Optional[str] = Field(default=None, max_length=100)
    mobile: str = Field(pattern=r"^\d{10}$")
    email: Optional[EmailStr] = None
    address: str = Field(min_length=5, max_length=300)
    group_president_name: Optional[str] = Field(default=None, max_length=100)
    bank_account_number: str = Field(pattern=r"^\d{9,18}$")
    bank_ifsc: str = Field(pattern=r"^[A-Za-z]{4}0[A-Za-z0-9]{6}$")
    bank_name_address: str = Field(min_length=3, max_length=200)
    district_name: str = Field(min_length=1, max_length=100)
    block_name: str = Field(min_length=1, max_length=100)
    account_holder_name: str = Field(min_length=2, max_length=100)
    crops: List[str] = Field(min_length=1, max_length=10)
    estimated_seed_date: date
    estimated_yield: Optional[str] = Field(default=None, max_length=50)

    @field_validator("name", "father_husband_name", "group_president_name", "account_holder_name")
    @classmethod
    def validate_name_fields(cls, value: Optional[str]) -> Optional[str]:
        value = _clean_optional(value)
        if value is not None and not NAME_PATTERN.match(value):
            raise ValueError("Name fields may contain only letters, spaces, dots, apostrophes, and hyphens")
        return value

    @field_validator("address", "bank_name_address", "district_name", "block_name", "estimated_yield")
    @classmethod
    def validate_text_fields(cls, value: Optional[str]) -> Optional[str]:
        value = _clean_optional(value)
        if value is not None and not TEXT_PATTERN.match(value):
            raise ValueError("Field contains unsupported characters")
        return value

    @field_validator("bank_ifsc")
    @classmethod
    def validate_ifsc(cls, value: str) -> str:
        value = value.strip().upper()
        if not IFSC_PATTERN.match(value):
            raise ValueError("Invalid IFSC format")
        return value

    @field_validator("crops")
    @classmethod
    def validate_crops(cls, values: List[str]) -> List[str]:
        cleaned = []
        for crop in values:
            crop = crop.strip()
            if not CROP_PATTERN.match(crop):
                raise ValueError("Crop names contain unsupported characters")
            cleaned.append(crop)
        return cleaned


class LandParcelCreate(BaseModel):
    khatauni_number: str = Field(min_length=1, max_length=50)
    khasra_number: str = Field(min_length=1, max_length=50)
    area_value: float = Field(gt=0, le=100000)
    area_unit: str = Field(pattern=r"^(acre|hectare)$")
    ownership_type: str = Field(pattern=r"^(owned|leased)$")
    cultivator_name: Optional[str] = Field(default=None, max_length=100)
    lease_period: Optional[str] = Field(default=None, max_length=50)

    @field_validator("khatauni_number", "khasra_number")
    @classmethod
    def validate_land_identifier(cls, value: str) -> str:
        value = value.strip()
        if not LAND_ID_PATTERN.match(value):
            raise ValueError("Land identifiers may contain only letters, numbers, slash, and hyphen")
        return value

    @field_validator("cultivator_name")
    @classmethod
    def validate_cultivator_name(cls, value: Optional[str]) -> Optional[str]:
        value = _clean_optional(value)
        if value is not None and not NAME_PATTERN.match(value):
            raise ValueError("Cultivator name contains unsupported characters")
        return value

    @field_validator("lease_period")
    @classmethod
    def validate_lease_period(cls, value: Optional[str]) -> Optional[str]:
        value = _clean_optional(value)
        if value is not None and not TEXT_PATTERN.match(value):
            raise ValueError("Lease period contains unsupported characters")
        return value


class FarmerRegistrationRequest(BaseModel):
    farmer: FarmerCreate
    land_parcels: List[LandParcelCreate] = Field(min_length=1, max_length=5)
    consent_accepted: bool
    consent_text_version: str = Field(default="farmer-registration-v1", max_length=50)

    @field_validator("consent_accepted")
    @classmethod
    def validate_consent(cls, value: bool) -> bool:
        if value is not True:
            raise ValueError("Privacy consent is required for farmer registration")
        return value


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


def _mask_mobile(mobile: str) -> str:
    return f"{mobile[:2]}******{mobile[-2:]}"


def _normalize_role(role_value) -> str:
    if role_value is None:
        return "farmer"
    if hasattr(role_value, "value"):
        role_value = role_value.value
    return str(role_value).split(".")[-1].lower()


def _enforce_farmer_scope(current_user, farmer_row):
    role = _normalize_role(current_user.get("role"))
    if role == "admin":
        return

    user_district = current_user.get("district")
    user_block = current_user.get("block")
    farmer_district = farmer_row.get("district_name")
    farmer_block = farmer_row.get("block_name")

    if role == "district_officer" and user_district == farmer_district:
        return
    if role == "block_officer" and user_district == farmer_district and user_block == farmer_block:
        return

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You do not have access to this farmer record",
    )


@router.post("/register", status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def register_farmer(
    request: Request,
    payload: FarmerRegistrationRequest,
    db: Session = Depends(get_db),
):
    farmer_data = payload.farmer.model_dump()
    farmer_data["mobile"] = _validate_mobile(farmer_data["mobile"])
    farmer_data["bank_ifsc"] = farmer_data["bank_ifsc"].strip().upper()
    # TODO: persist consent_accepted and consent_text_version after a DB migration adds consent columns.

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
@limiter.limit("10/minute")
def check_enrollment_status(
    request: Request,
    mobile: str,
    db: Session = Depends(get_db),
):
    validated_mobile = _validate_mobile(mobile)

    farmer_query = text(
        """
        SELECT
            farmer_id,
            mobile,
            district_name,
            block_name,
            created_at
        FROM farmers
        WHERE mobile = :mobile
        LIMIT 1
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

        return {
            "status": "found",
            "message": "Enrollment found",
            "farmer": {
                "masked_mobile": _mask_mobile(farmer_row["mobile"]),
                "district_name": farmer_row["district_name"],
                "block_name": farmer_row["block_name"],
                "created_at": _serialize_value(farmer_row["created_at"]),
            },
        }
    except HTTPException:
        raise
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch enrollment status",
        ) from exc


@router.get("/status/{mobile}/full")
@limiter.limit("20/minute")
def check_enrollment_status_full(
    request: Request,
    mobile: str,
    current_user=Depends(require_role("admin", "district_officer", "block_officer")),
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
        farmer_row = db.execute(farmer_query, {"mobile": validated_mobile}).mappings().first()
        if farmer_row is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No enrollment found for this mobile number",
            )

        _enforce_farmer_scope(current_user, farmer_row)

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
