from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models.millet_production import MilletProduction

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


# KPI Endpoint
@router.get("/kpis")
def get_kpis(db: Session = Depends(get_db)):

    total_districts = db.query(
        func.count(func.distinct(MilletProduction.district))
    ).scalar()

    total_millets = db.query(
        func.count(func.distinct(MilletProduction.millet_type))
    ).scalar()

    total_production = db.query(
        func.sum(MilletProduction.production_quintal)
    ).scalar()

    total_area = db.query(
        func.sum(MilletProduction.farmer_count)
    ).scalar()
    return {
        "total_districts": total_districts or 0,
        "total_millets": total_millets or 0,
        "total_production": total_production or 0,
        "total_area": total_area or 0
    }