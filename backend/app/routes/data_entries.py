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
    section_key: Optional[str] = None
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
        "section_key": entry.section_key,
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
    section_key: Optional[str] = None,
):
    """Build a read query scoped to the current officer role."""
    current_role = normalize_role(current_user.get("role"))
    query = db.query(DistrictBlockDataEntry).filter(
        DistrictBlockDataEntry.scope_type == scope_type
    )

    if section_key:
        query = query.filter(DistrictBlockDataEntry.section_key == section_key)

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
    section_key: Optional[str] = None,
) -> dict:
    """Insert new rows and update visible existing rows for one scope."""
    saved_entries = []
    clean_section_key = _clean_text(section_key, 120) if section_key else None

    for row in request.entries:
        district, block = _resolve_write_scope(scope_type, current_user, row)
        row_section_key = clean_section_key or _clean_text(row.section_key, 120)

        if row.id:
            entry_query = _query_for_scope(
                db,
                scope_type,
                current_user,
                section_key=row_section_key,
            ).filter(DistrictBlockDataEntry.id == row.id)
            entry = entry_query.first()
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

        entry.section_key = row_section_key
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


def _delete_entry(
    scope_type: str,
    entry_id: int,
    current_user,
    db: Session,
    section_key: Optional[str] = None,
) -> dict:
    """Delete one visible row from the current user's allowed scope."""
    clean_section_key = _clean_text(section_key, 120) if section_key else None
    entry = (
        _query_for_scope(db, scope_type, current_user, section_key=clean_section_key)
        .filter(DistrictBlockDataEntry.id == entry_id)
        .first()
    )

    if entry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Data entry not found",
        )

    db.delete(entry)
    db.commit()
    return {"deleted_id": entry_id}


@router.get("/district")
def get_district_data_entries(
    district: Optional[str] = Query(default=None),
    section_key: Optional[str] = Query(default=None),
    current_user=Depends(require_role("admin", "district")),
    db: Session = Depends(get_db),
):
    """
    Fetch district data-entry rows visible to the current user.

    District officers are forced to their assigned district. Admin users may
    optionally filter by district or fetch all district-scope entries.
    """
    rows = (
        _query_for_scope(db, "district", current_user, district=district, section_key=section_key)
        .order_by(DistrictBlockDataEntry.id.asc())
        .all()
    )
    return {"entries": [_entry_response(row) for row in rows]}


@router.post("/district")
def save_district_data_entries(
    request: SaveDataEntriesRequest,
    section_key: Optional[str] = Query(default=None),
    current_user=Depends(require_role("admin", "district")),
    db: Session = Depends(get_db),
):
    """
    Save district data-entry rows for the current user's allowed district scope.
    """
    return _save_entries("district", request, current_user, db, section_key=section_key)


@router.delete("/district/{entry_id}")
def delete_district_data_entry(
    entry_id: int,
    section_key: Optional[str] = Query(default=None),
    current_user=Depends(require_role("admin", "district")),
    db: Session = Depends(get_db),
):
    """
    Delete one district data-entry row visible to the current user.
    """
    return _delete_entry("district", entry_id, current_user, db, section_key=section_key)


@router.get("/block")
def get_block_data_entries(
    district: Optional[str] = Query(default=None),
    block: Optional[str] = Query(default=None),
    section_key: Optional[str] = Query(default=None),
    current_user=Depends(require_role("admin", "block")),
    db: Session = Depends(get_db),
):
    """
    Fetch block data-entry rows visible to the current user.

    Block officers are forced to their assigned district and block. Admin users
    may optionally filter or fetch all block-scope entries.
    """
    rows = (
        _query_for_scope(
            db,
            "block",
            current_user,
            district=district,
            block=block,
            section_key=section_key,
        )
        .order_by(DistrictBlockDataEntry.id.asc())
        .all()
    )
    return {"entries": [_entry_response(row) for row in rows]}


@router.post("/block")
def save_block_data_entries(
    request: SaveDataEntriesRequest,
    section_key: Optional[str] = Query(default=None),
    current_user=Depends(require_role("admin", "block")),
    db: Session = Depends(get_db),
):
    """
    Save block data-entry rows for the current user's allowed block scope.
    """
    return _save_entries("block", request, current_user, db, section_key=section_key)


@router.delete("/block/{entry_id}")
def delete_block_data_entry(
    entry_id: int,
    section_key: Optional[str] = Query(default=None),
    current_user=Depends(require_role("admin", "block")),
    db: Session = Depends(get_db),
):
    """
    Delete one block data-entry row visible to the current user.
    """
    return _delete_entry("block", entry_id, current_user, db, section_key=section_key)
