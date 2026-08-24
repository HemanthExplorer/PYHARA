from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.core.deps import get_current_user
from app.schemas.wishlist import WishlistCreate, WishlistResponse
from app.services import wishlist_service

router = APIRouter(prefix="/api/wishlist", tags=["Wishlist"])


@router.get("", response_model=List[WishlistResponse])
def get_wishlist(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """
    Retrieves saved wishlist items for the authenticated customer.
    """
    return wishlist_service.get_user_wishlist(db=db, user_id=current_user.id)


@router.post("", response_model=WishlistResponse, status_code=status.HTTP_201_CREATED)
def add_to_wishlist(
    wishlist_in: WishlistCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Adds a product to the customer's wishlist.
    """
    return wishlist_service.add_to_wishlist(
        db=db, user_id=current_user.id, product_id=wishlist_in.product_id
    )


@router.delete("/{product_id}")
def remove_from_wishlist(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Removes a product from the customer's wishlist.
    """
    wishlist_service.remove_from_wishlist(
        db=db, user_id=current_user.id, product_id=product_id
    )
    return {"message": "Product removed from wishlist."}
