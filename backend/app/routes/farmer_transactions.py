"""Normalized farmer scheme transaction API routes."""

from datetime import date
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from ..database import get_db
from ..services.scheme_transactions import (
    SCHEME_TYPES,
    insert_transaction_rows,
    scheme_summary,
)
from .auth import require_role

router = APIRouter(prefix="/farmer-transactions", tags=["Farmer Scheme Transactions"])


class FarmerSchemeTransactionPayload(BaseModel):
    """Create/update payload for one normalized farmer scheme transaction."""

    farmer_id: Optional[int] = None
    farmer_code: Optional[str] = Field(default=None, max_length=120)
    name: Optional[str] = Field(default=None, max_length=200)
    district: Optional[str] = Field(default=None, max_length=120)
    block: Optional[str] = Field(default=None, max_length=120)
    village: Optional[str] = Field(default=None, max_length=160)
    mobile: Optional[str] = Field(default=None, max_length=20)

    scheme_type: str
    millet_type: Optional[str] = Field(default=None, max_length=120)
    quantity: Optional[Decimal] = None
    area_ha: Optional[Decimal] = None
    no_of_items: Optional[int] = None
    production: Optional[Decimal] = None
    type_of_sowing: Optional[str] = Field(default=None, max_length=120)
    incentive: Optional[Decimal] = None
    award: Optional[Decimal] = None
    transaction_date: Optional[date] = None
    remarks: Optional[str] = Field(default=None, max_length=500)

    @field_validator("scheme_type")
    @classmethod
    def validate_scheme_type(cls, value: str) -> str:
        """Allow only the normalized scheme types."""
        normalized = (value or "").strip()
        if normalized not in SCHEME_TYPES:
            raise ValueError(f"scheme_type must be one of: {', '.join(SCHEME_TYPES)}")
        return normalized


class BulkFarmerSchemeTransactionRequest(BaseModel):
    """Bulk transaction create request."""

    rows: list[FarmerSchemeTransactionPayload] = Field(default_factory=list)


@router.get("/scheme-types")
def list_scheme_types():
    """Return supported normalized scheme types."""
    return {"scheme_types": list(SCHEME_TYPES)}


@router.get("/summary")
def get_farmer_scheme_summary(
    district: Optional[str] = Query(default=None),
    block: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    """Return public aggregate scheme reporting data without farmer PII."""
    return jsonable_encoder(
        {
            "rows": scheme_summary(
                db,
                district=district,
                block=block,
            )
        }
    )


@router.post("", status_code=status.HTTP_201_CREATED)
def create_farmer_scheme_transactions(
    request: BulkFarmerSchemeTransactionRequest,
    current_user=Depends(require_role("admin", "district", "block")),
    db: Session = Depends(get_db),
):
    """Create one or more normalized scheme transactions."""
    try:
        inserted_rows = insert_transaction_rows(
            db,
            [row.model_dump(exclude_none=True) for row in request.rows],
            current_user=current_user,
        )
        db.commit()
    except HTTPException:
        db.rollback()
        raise
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save farmer scheme transactions",
        ) from exc

    return jsonable_encoder(
        {
            "inserted_count": len(inserted_rows),
            "rows": inserted_rows,
        }
    )

