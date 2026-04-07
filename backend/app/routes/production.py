from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models.millet_production import MilletProduction

router = APIRouter(prefix="/production", tags=["Production"])


# Get all production data
@router.get("/all")
def get_all_production(db: Session = Depends(get_db)):

    records = db.query(MilletProduction).all()

    return [
        {
            "id": r.id,
            "district": r.district,
            "block": r.block,
            "village": r.village,
            "millet_type": r.millet_type,
            "production_quintal": r.production_quintal,
            "year": r.year,
            "farmer_count": r.farmer_count,
        }
        for r in records
    ]


# District production
@router.get("/district")
def district_production(db: Session = Depends(get_db)):

    data = (
        db.query(
            MilletProduction.district,
            func.sum(MilletProduction.production_quintal)
        )
        .group_by(MilletProduction.district)
        .all()
    )

    return [
        {
            "district": d,
            "production": p
        }
        for d, p in data
    ]


# Millet production
@router.get("/millet")
def millet_production(db: Session = Depends(get_db)):

    data = (
        db.query(
            MilletProduction.millet_type,
            func.sum(MilletProduction.production_quintal)
        )
        .group_by(MilletProduction.millet_type)
        .all()
    )

    return [
        {
            "millet": m,
            "production": p
        }
        for m, p in data
    ]