"""
Production reporting endpoints for the Millet MIS dashboard.

The routes provide raw production records and grouped summaries used by chart
components, KPI cards, and detailed production tables.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models.production import Production
from .reporting_helpers import query_failed, to_float

router = APIRouter(prefix="/production", tags=["Production"])


@router.get("/all")
def get_all_production(db: Session = Depends(get_db)):
    """
    Return all production records in frontend-friendly field names.

    Args:
        db (Session): Request-scoped database session.

    Returns:
        list[dict]: Production rows with numeric values normalized to floats.

    Raises:
        HTTPException: When production records cannot be fetched.
    """
    try:
        records = db.query(Production).all()

        return [
            {
                "id": r.id,
                "district_id": r.district_id,
                "block_id": r.block_id,
                "millet_id": r.millet_id,
                "season_id": r.season_id,
                "year": r.year,
                "area_hectare": to_float(r.area_hectare),
                "production": to_float(r.production_ton),
            }
            for r in records
        ]
    except Exception:
        raise query_failed("Error fetching production data")


@router.get("/district")
def district_production(db: Session = Depends(get_db)):
    """
    Aggregate production quantity by district identifier.

    Args:
        db (Session): Request-scoped database session.

    Returns:
        list[dict]: District identifiers with total production quantities.

    Raises:
        HTTPException: When district aggregation fails.
    """
    try:
        data = (
            db.query(
                Production.district_id,
                func.sum(Production.production_ton).label("production"),
            )
            .group_by(Production.district_id)
            .all()
        )

        return [
            {
                "district_id": d,
                "production": to_float(p),
            }
            for d, p in data
        ]
    except Exception:
        raise query_failed("Error fetching district production")


@router.get("/millet")
def millet_production(db: Session = Depends(get_db)):
    """
    Aggregate production quantity by millet crop identifier.

    Args:
        db (Session): Request-scoped database session.

    Returns:
        list[dict]: Millet identifiers with total production quantities.

    Raises:
        HTTPException: When millet aggregation fails.
    """
    try:
        data = (
            db.query(
                Production.millet_id,
                func.sum(Production.production_ton).label("production"),
            )
            .group_by(Production.millet_id)
            .all()
        )

        return [
            {
                "millet_id": m,
                "production": to_float(p),
            }
            for m, p in data
        ]
    except Exception:
        raise query_failed("Error fetching millet production")
