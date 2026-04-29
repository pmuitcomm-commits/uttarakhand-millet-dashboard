"""
Procurement reporting endpoints for the Millet MIS dashboard.

These endpoints publish procurement targets, procurement achievement, centre
counts, and farmer/SHG coverage used by the procurement monitoring page.
"""

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.procurement import Procurement
from .reporting_helpers import query_failed

router = APIRouter(prefix="/procurement", tags=["Procurement"])


@router.get("/all")
def get_all_procurement(db: Session = Depends(get_db)):
    """
    Return procurement records with display labels expected by the frontend.

    Args:
        db (Session): Request-scoped database session.

    Returns:
        list[dict]: District and crop-wise procurement metrics.

    Raises:
        HTTPException: When procurement records cannot be fetched.
    """
    try:
        records = db.query(Procurement).all()

        return [
            {
                "S.no": r.id,
                "District": r.district,
                "Crop": r.crop,
                "Nos.of Centre": r.centres,
                "Target (in MT)": r.target_mt,
                "No. of Farmer's /SHGs": r.farmers_count,
                "Procurement quantity (in MT)": r.procurement_mt,
                "Procurement (in %)": r.procurement_percent,
                "Procurement by Pvt. agencies (in MT)": r.private_procurement_mt,
            }
            for r in records
        ]
    except Exception:
        raise query_failed("Error fetching procurement data")


@router.get("/kpis")
def get_procurement_kpis(db: Session = Depends(get_db)):
    """
    Calculate procurement summary KPIs for dashboard cards.

    Args:
        db (Session): Request-scoped database session.

    Returns:
        dict: Centre, target, farmer, procurement, and crop coverage metrics.

    Raises:
        HTTPException: When procurement KPI aggregation fails.
    """
    try:
        # Null aggregate results are normalized to zero so dashboard cards do
        # not show missing values while source data is being onboarded.
        total_districts = db.query(Procurement.district).distinct().count()
        total_centres = db.query(func.sum(Procurement.centres)).scalar() or 0
        total_target = db.query(func.sum(Procurement.target_mt)).scalar() or 0
        total_farmers = db.query(func.sum(Procurement.farmers_count)).scalar() or 0
        total_procurement = db.query(func.sum(Procurement.procurement_mt)).scalar() or 0
        avg_procurement = db.query(func.avg(Procurement.procurement_percent)).scalar() or 0
        pvt_agencies = db.query(func.sum(Procurement.private_procurement_mt)).scalar() or 0
        crop_coverage = db.query(Procurement.crop).distinct().count()

        return {
            "total_districts": total_districts,
            "total_centres": total_centres,
            "total_target": total_target,
            "total_farmers": total_farmers,
            "total_procurement": total_procurement,
            "avg_procurement": round(avg_procurement, 2),
            "pvt_agencies_procurement": pvt_agencies,
            "crop_coverage": crop_coverage,
        }
    except Exception:
        raise query_failed("Error fetching procurement KPIs")
