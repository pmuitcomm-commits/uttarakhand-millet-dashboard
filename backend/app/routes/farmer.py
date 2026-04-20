from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import date
from app.database import supabase

router = APIRouter()


# -------------------------
# Pydantic Models
# -------------------------

class FarmerCreate(BaseModel):
    name: str
    father_husband_name: Optional[str] = None
    mobile: str
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
    estimated_yield: str


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


# -------------------------
# Register Farmer
# -------------------------

@router.post("/register")
def register_farmer(payload: FarmerRegistrationRequest):
    try:
        farmer_data = payload.farmer.dict()

        farmer_response = supabase.table("farmers").insert(farmer_data).execute()

        if not farmer_response.data:
            raise HTTPException(status_code=400, detail="Failed to insert farmer")

        farmer_id = farmer_response.data[0]["farmer_id"]

        parcel_rows = []
        for parcel in payload.land_parcels:
            row = parcel.dict()
            row["farmer_id"] = farmer_id
            parcel_rows.append(row)

        if parcel_rows:
            supabase.table("land_parcels").insert(parcel_rows).execute()

        return {
            "message": "Farmer registered successfully",
            "farmer_id": farmer_id
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------------------------
# Check Enrollment Status
# -------------------------

@router.get("/status/{mobile}")
def check_status(mobile: str):
    try:
        farmer_response = (
            supabase
            .table("farmers")
            .select("*")
            .eq("mobile", mobile)
            .execute()
        )

        if not farmer_response.data:
            raise HTTPException(status_code=404, detail="No enrollment found")

        farmer = farmer_response.data[0]

        parcel_response = (
            supabase
            .table("land_parcels")
            .select("*")
            .eq("farmer_id", farmer["farmer_id"])
            .execute()
        )

        return {
            "farmer": farmer,
            "land_parcels": parcel_response.data or []
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))