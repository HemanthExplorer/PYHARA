from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.deps import get_current_admin
from app.models.user import User
from app.schemas.delivery_location import (
    DeliveryLocationCreate,
    DeliveryLocationUpdate,
    DeliveryLocationResponse,
)
from app.services import location_service

router = APIRouter(prefix="/api/admin/locations", tags=["Admin Delivery Locations"])


@router.get("", response_model=List[DeliveryLocationResponse])
def list_admin_locations(
    search: Optional[str] = Query(default=None),
    active_only: Optional[bool] = Query(default=None),
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin),
):
    """Admin endpoint: Search & list configured delivery locations."""
    return location_service.get_delivery_locations(db, search=search, active_only=active_only)


@router.post("", response_model=DeliveryLocationResponse, status_code=status.HTTP_201_CREATED)
def create_admin_location(
    location_in: DeliveryLocationCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin),
):
    """Admin endpoint: Add a new allowed delivery PIN code / location."""
    return location_service.create_delivery_location(db, location_in)


@router.put("/{location_id}", response_model=DeliveryLocationResponse)
def update_admin_location(
    location_id: str,
    location_update: DeliveryLocationUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin),
):
    """Admin endpoint: Edit delivery location, charges, delivery days, or toggle active status."""
    return location_service.update_delivery_location(db, location_id, location_update)


@router.delete("/{location_id}", status_code=status.HTTP_200_OK)
def delete_admin_location(
    location_id: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin),
):
    """Admin endpoint: Remove a delivery location."""
    location_service.delete_delivery_location(db, location_id)
    return {"status": "success", "message": f"Delivery location '{location_id}' deleted successfully."}
