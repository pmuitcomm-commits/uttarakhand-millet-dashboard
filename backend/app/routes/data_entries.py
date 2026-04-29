"""
Scoped district/block data-entry endpoints for officer-entered MIS rows.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.data_entry import DistrictBlockDataEntry
from .auth import require_role
from .auth_roles import normalize_role

router = APIRouter(prefix="/data-entries", tags=["Data Entries"])


class DataEntryPayload(BaseModel):
    """Editable row payload from the Excel-like data entry table."""

    id: Optional[int] = None
    district: Optional[str] = None
    block: Optional[str] = None
    data_type: Optional[str] = None
    metric_name: str
    value: Optional[str | int | float] = None
    unit: Optional[str] = None
    reporting_period: Optional[str] = None
    remarks: Optional[str] = None


class SaveDataEntriesRequest(BaseModel):
    """Bulk save payload for new and edited rows."""

    entries: list[DataEntryPayload]


def _clean_text(value, max_length: int, required: bool = False) -> Optional[str]:
    """Normalize user-entered cell text and enforce small field limits."""
    if value is None:
        if required:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Required fields cannot be empty",
            )
        return None

    cleaned = str(value).strip()
    if required and not cleaned:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Required fields cannot be empty",
        )
    if not cleaned:
        return None
    return cleaned[:max_length]


def _entry_response(entry: DistrictBlockDataEntry) -> dict:
    """Serialize a data-entry row for the React table."""
    return {
        "id": entry.id,
        "scope_type": entry.scope_type,
        "district": entry.district,
        "block": entry.block,
        "data_type": entry.data_type,
        "metric_name": entry.metric_name,
        "value": entry.value,
        "unit": entry.unit,
        "reporting_period": entry.reporting_period,
        "remarks": entry.remarks,
        "created_by": entry.created_by,
        "created_at": entry.created_at.isoformat() if entry.created_at else None,
        "updated_at": entry.updated_at.isoformat() if entry.updated_at else None,
    }


def _query_for_scope(
    db: Session,
    scope_type: str,
    current_user,
    district: Optional[str] = None,
    block: Optional[str] = None,
):
    """Build a read query scoped to the current officer role."""
    current_role = normalize_role(current_user.get("role"))
    query = db.query(DistrictBlockDataEntry).filter(
        DistrictBlockDataEntry.scope_type == scope_type
    )

    if current_role == "admin":
        if district:
            query = query.filter(DistrictBlockDataEntry.district == district)
        if scope_type == "block" and block:
            query = query.filter(DistrictBlockDataEntry.block == block)
        return query

    if scope_type == "district" and current_role == "district":
        return query.filter(DistrictBlockDataEntry.district == current_user["district"])

    if scope_type == "block" and current_role == "block":
        return query.filter(
            DistrictBlockDataEntry.district == current_user["district"],
            DistrictBlockDataEntry.block == current_user["block"],
        )

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Not authorized for this data scope",
    )


def _resolve_write_scope(scope_type: str, current_user, entry: DataEntryPayload) -> tuple[str, Optional[str]]:
    """Resolve target district/block from role scope rather than trusting clients."""
    current_role = normalize_role(current_user.get("role"))

    if current_role == "admin":
        district = _clean_text(entry.district, 120, required=True)
        block = _clean_text(entry.block, 120, required=scope_type == "block")
        return district, block if scope_type == "block" else None

    if scope_type == "district" and current_role == "district":
        return current_user["district"], None

    if scope_type == "block" and current_role == "block":
        return current_user["district"], current_user["block"]

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Not authorized for this data scope",
    )


def _save_entries(
    scope_type: str,
    request: SaveDataEntriesRequest,
    current_user,
    db: Session,
) -> dict:
    """Insert new rows and update visible existing rows for one scope."""
    saved_entries = []

    for row in request.entries:
        district, block = _resolve_write_scope(scope_type, current_user, row)

        if row.id:
            entry = _query_for_scope(db, scope_type, current_user).filter(
                DistrictBlockDataEntry.id == row.id
            ).first()
            if entry is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Data entry not found",
                )
        else:
            entry = DistrictBlockDataEntry(
                scope_type=scope_type,
                created_by=current_user["id"],
            )
            db.add(entry)

        entry.district = district
        entry.block = block
        entry.data_type = _clean_text(row.data_type, 120)
        entry.metric_name = _clean_text(row.metric_name, 240, required=True)
        entry.value = _clean_text(row.value, 120)
        entry.unit = _clean_text(row.unit, 80)
        entry.reporting_period = _clean_text(row.reporting_period, 120)
        entry.remarks = _clean_text(row.remarks, 500)
        saved_entries.append(entry)

    db.commit()

    for entry in saved_entries:
        db.refresh(entry)

    return {"entries": [_entry_response(entry) for entry in saved_entries]}


@router.get("/district")
def get_district_data_entries(
    district: Optional[str] = Query(default=None),
    current_user=Depends(require_role("admin", "district")),
    db: Session = Depends(get_db),
):
    """
    Fetch district data-entry rows visible to the current user.

    District officers are forced to their assigned district. Admin users may
    optionally filter by district or fetch all district-scope entries.
    """
    rows = (
        _query_for_scope(db, "district", current_user, district=district)
        .order_by(DistrictBlockDataEntry.id.asc())
        .all()
    )
    return {"entries": [_entry_response(row) for row in rows]}


@router.post("/district")
def save_district_data_entries(
    request: SaveDataEntriesRequest,
    current_user=Depends(require_role("admin", "district")),
    db: Session = Depends(get_db),
):
    """
    Save district data-entry rows for the current user's allowed district scope.
    """
    return _save_entries("district", request, current_user, db)


@router.get("/block")
def get_block_data_entries(
    district: Optional[str] = Query(default=None),
    block: Optional[str] = Query(default=None),
    current_user=Depends(require_role("admin", "block")),
    db: Session = Depends(get_db),
):
    """
    Fetch block data-entry rows visible to the current user.

    Block officers are forced to their assigned district and block. Admin users
    may optionally filter or fetch all block-scope entries.
    """
    rows = (
        _query_for_scope(db, "block", current_user, district=district, block=block)
        .order_by(DistrictBlockDataEntry.id.asc())
        .all()
    )
    return {"entries": [_entry_response(row) for row in rows]}


@router.post("/block")
def save_block_data_entries(
    request: SaveDataEntriesRequest,
    current_user=Depends(require_role("admin", "block")),
    db: Session = Depends(get_db),
):
    """
    Save block data-entry rows for the current user's allowed block scope.
    """
    return _save_entries("block", request, current_user, db)
