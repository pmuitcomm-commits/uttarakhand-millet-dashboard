"""
Pydantic schemas and field validation for farmer registration routes.
"""

from datetime import date
import re
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

NAME_PATTERN = re.compile(r"^[A-Za-z][A-Za-z .'-]{0,99}$")
TEXT_PATTERN = re.compile(r"^[A-Za-z0-9\s,./&()#:%'-]+$")
LAND_ID_PATTERN = re.compile(r"^[A-Za-z0-9/-]{1,50}$")
CROP_PATTERN = re.compile(r"^[A-Za-z][A-Za-z0-9\s-]{0,49}$")
IFSC_PATTERN = re.compile(r"^[A-Za-z]{4}0[A-Za-z0-9]{6}$")
OTP_PATTERN = re.compile(r"^\d{4,8}$")


def _clean_optional(value: Optional[str]) -> Optional[str]:
    if value is None:
        return value
    value = value.strip()
    return value or None


class FarmerCreate(BaseModel):
    """Pydantic schema for farmer identity, bank, crop, and location payload."""

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
    """Pydantic schema for owned or leased land parcel details."""

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
    """Complete farmer registration request with land parcels and consent."""

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


class EnrollmentOtpRequest(BaseModel):
    """Request body for public enrollment-status OTP delivery."""

    mobile_number: str = Field(pattern=r"^\d{10}$")

    @field_validator("mobile_number", mode="before")
    @classmethod
    def validate_mobile_number(cls, value) -> str:
        return str(value).strip()


class EnrollmentOtpVerifyRequest(EnrollmentOtpRequest):
    """Request body for OTP-gated public enrollment-status verification."""

    otp: str = Field(pattern=r"^\d{4,8}$")

    @field_validator("otp", mode="before")
    @classmethod
    def validate_otp(cls, value) -> str:
        value = str(value).strip()
        if not OTP_PATTERN.match(value):
            raise ValueError("OTP must contain 4 to 8 digits")
        return value
