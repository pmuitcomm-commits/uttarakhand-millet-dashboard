from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
import logging

from ..database import get_db
from ..models.production import Production

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/kpis")
def get_kpis(db: Session = Depends(get_db)):
    try:
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
            "total_production": float(total_production or 0),
            "total_area": float(total_area or 0),
        }
    except Exception:
        logging.error("Error fetching dashboard KPIs", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching dashboard KPIs"
        )