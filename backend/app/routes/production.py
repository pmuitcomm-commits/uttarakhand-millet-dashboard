"""
Production reporting endpoints for the Millet MIS dashboard.

The routes provide raw production records and grouped summaries used by chart
components, KPI cards, and detailed production tables.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
import logging

from ..database import get_db
from ..models.production import Production

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
                "area_hectare": float(r.area_hectare) if r.area_hectare is not None else 0,
                "production": float(r.production_ton) if r.production_ton is not None else 0,
            }
            for r in records
        ]
    except Exception:
        logging.error("Error fetching production data", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching production data"
        )


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
                "production": float(p) if p is not None else 0,
            }
            for d, p in data
        ]
    except Exception:
        logging.error("Error fetching district production", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching district production"
        )


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
                "production": float(p) if p is not None else 0,
            }
            for m, p in data
        ]
    except Exception:
        logging.error("Error fetching millet production", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching millet production"
        )
