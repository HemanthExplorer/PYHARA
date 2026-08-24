from typing import List, Dict, Any
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.core.deps import get_current_user
from app.schemas.review import ReviewCreate, ReviewResponse
from app.services import review_service

router = APIRouter(prefix="/api/products", tags=["Reviews"])


@router.get("/{product_id}/reviews", response_model=List[ReviewResponse])
def get_product_reviews(product_id: str, db: Session = Depends(get_db)):
    """
    Public endpoint: Retrieves all customer reviews for a specific product.
    """
    return review_service.get_product_reviews(db=db, product_id=product_id)


@router.get("/{product_id}/rating-summary")
def get_product_rating_summary(product_id: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Public endpoint: Returns total count and average star rating for a product.
    """
    return review_service.get_product_rating_summary(db=db, product_id=product_id)


@router.post("/{product_id}/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    product_id: str,
    review_in: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Authenticated customer: Submits a review for a product. Checks purchase history for verified buyer badge.
    """
    user_display = current_user.full_name or current_user.username
    return review_service.create_review(
        db=db,
        product_id=product_id,
        user_id=current_user.id,
        user_name=user_display,
        review_in=review_in,
    )
