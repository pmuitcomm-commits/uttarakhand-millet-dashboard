from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
import logging

from ..database import get_db
from ..models.procurement import Procurement

router = APIRouter(prefix="/procurement", tags=["Procurement"])


@router.get("/all")
def get_all_procurement(db: Session = Depends(get_db)):
    try:
        records = db.query(Procurement).all()

        return [
            {
                "S.no": r.s_no,
                "District": r.district,
                "Crop": r.crop,
                "Nos.of Centre": r.nos_of_centre,
                "Target (in MT)": r.target_in_mt,
                "No. of Farmer's /SHGs": r.no_of_farmers_shgs,
                "Procurement quantity (in MT)": r.procurement_quantity_in_mt,
                "Procurement (in %)": r.procurement_in_percent,
                "Procurement by Pvt. agencies (in MT)": r.procurement_by_pvt_agencies_in_mt,
            }
            for r in records
        ]
    except Exception:
        logging.error("Error fetching procurement data", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching procurement data"
        )


@router.get("/kpis")
def get_procurement_kpis(db: Session = Depends(get_db)):
    try:
        total_districts = db.query(Procurement.district).distinct().count()
        total_centres = db.query(func.sum(Procurement.nos_of_centre)).scalar() or 0
        total_target = db.query(func.sum(Procurement.target_in_mt)).scalar() or 0
        total_farmers = db.query(func.sum(Procurement.no_of_farmers_shgs)).scalar() or 0
        total_procurement = db.query(func.sum(Procurement.procurement_quantity_in_mt)).scalar() or 0
        avg_procurement = db.query(func.avg(Procurement.procurement_in_percent)).scalar() or 0
        pvt_agencies = db.query(func.sum(Procurement.procurement_by_pvt_agencies_in_mt)).scalar() or 0
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
        logging.error("Error fetching procurement KPIs", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching procurement KPIs"
        )