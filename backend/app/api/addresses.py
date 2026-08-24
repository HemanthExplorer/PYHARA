from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.core.deps import get_current_user
from app.schemas.address import AddressCreate, AddressUpdate, AddressResponse
from app.services import address_service

router = APIRouter(prefix="/api/addresses", tags=["Addresses"])


@router.get("", response_model=List[AddressResponse])
def get_user_addresses(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """
    Returns saved addresses for the authenticated customer.
    """
    return address_service.get_user_addresses(db=db, user_id=current_user.id)


@router.post("", response_model=AddressResponse, status_code=status.HTTP_201_CREATED)
def create_address(
    address_in: AddressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Adds a new saved address for the authenticated customer.
    """
    return address_service.create_address(db=db, user_id=current_user.id, address_in=address_in)


@router.put("/{address_id}", response_model=AddressResponse)
def update_address(
    address_id: str,
    address_update: AddressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Updates an existing address belonging to the authenticated customer.
    """
    return address_service.update_address(
        db=db, address_id=address_id, user_id=current_user.id, address_update=address_update
    )


@router.delete("/{address_id}")
def delete_address(
    address_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Deletes an address belonging to the authenticated customer.
    """
    address_service.delete_address(db=db, address_id=address_id, user_id=current_user.id)
    return {"message": "Address deleted successfully."}


@router.put("/{address_id}/default", response_model=AddressResponse)
def set_default_address(
    address_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Sets the specified address as the customer's default shipping address.
    """
    return address_service.set_default_address(
        db=db, address_id=address_id, user_id=current_user.id
    )
