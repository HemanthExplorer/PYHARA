from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.delivery_location import ServiceabilityResponse
from app.services.location_service import lookup_pincode, check_serviceability

router = APIRouter(prefix="/api/location", tags=["Location"])


class PincodeResponse(BaseModel):
    valid: bool
    pincode: str
    city: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    source: Optional[str] = None
    error: Optional[str] = None


@router.get("/pincode/{pincode}", response_model=PincodeResponse)
def verify_pincode(pincode: str):
    """
    Public endpoint: Validates Indian 6-digit PIN code format and returns postal City & State.
    """
    res = lookup_pincode(pincode)
    if not res["valid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=res.get("error", "Invalid Indian 6-digit PIN code."),
        )
    return PincodeResponse(**res)


@router.get("/serviceability/{pincode}", response_model=ServiceabilityResponse)
def verify_serviceability(pincode: str, db: Session = Depends(get_db)):
    """
    Public endpoint: Checks delivery availability against admin-configured DB locations.
    """
    return check_serviceability(db, pincode)
