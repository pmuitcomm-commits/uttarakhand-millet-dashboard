from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
import logging

from ..database import get_db
from ..models.production import Production
from ..models.district import District
from ..models.block import Block
from ..models.millet import Millet

router = APIRouter(prefix="/production", tags=["Production"])


@router.get("/all")
def get_all_production(db: Session = Depends(get_db)):
    try:
        records = (
            db.query(
                Production.id,
                District.name.label("district"),
                Block.name.label("block"),
                Millet.name.label("millet"),
                Production.year,
                Production.area_hectare,
                Production.production_ton,
            )
            .outerjoin(District, Production.district_id == District.id)
            .outerjoin(Block, Production.block_id == Block.id)
            .outerjoin(Millet, Production.millet_id == Millet.id)
            .all()
        )

        return [
            {
                "id": r.id,
                "district": r.district,
                "block": r.block,
                "millet": r.millet,
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
    try:
        data = (
            db.query(
                District.name.label("district"),
                func.sum(Production.production_ton).label("production"),
            )
            .outerjoin(District, Production.district_id == District.id)
            .group_by(District.name)
            .all()
        )

        return [
            {
                "district": d,
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
    try:
        data = (
            db.query(
                Millet.name.label("millet"),
                func.sum(Production.production_ton).label("production"),
            )
            .outerjoin(Millet, Production.millet_id == Millet.id)
            .group_by(Millet.name)
            .all()
        )

        return [
            {
                "millet": m,
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