"""
Dashboard aggregate endpoints for the Millet MIS overview page.

These routes expose state-level KPI values derived from production records so
the React dashboard can display high-level scheme performance indicators.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models.production import Production
from .reporting_helpers import query_failed, to_float

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/kpis")
def get_kpis(db: Session = Depends(get_db)):
    """
    Calculate top-level production KPIs for the public dashboard.

    Args:
        db (Session): Request-scoped database session.

    Returns:
        dict: District count, millet count, total production, and total area.

    Raises:
        HTTPException: When KPI aggregation fails.
    """
    try:
        # Distinct counts and sums intentionally coerce null aggregates to zero
        # so the frontend receives stable numeric values during empty datasets.
        total_districts = db.query(
            func.count(func.distinct(Production.district_id))
        ).scalar()

        total_millets = db.query(
            func.count(func.distinct(Production.millet_id))
        ).scalar()

        total_production = db.query(
            func.sum(Production.production_ton)
        ).scalar()

        total_area = db.query(
            func.sum(Production.area_hectare)
        ).scalar()

        return {
            "total_districts": total_districts or 0,
            "total_millets": total_millets or 0,
            "total_production": to_float(total_production),
            "total_area": to_float(total_area),
        }
    except Exception:
        raise query_failed("Error fetching dashboard KPIs")
