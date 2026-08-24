from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.deps import get_current_admin
from app.models.user import User
from app.schemas.auth import UserResponse
from app.schemas.review import ReviewResponse
from app.schemas.dashboard import DashboardResponse
from app.services import admin_service, review_service

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/dashboard", response_model=DashboardResponse)
def get_admin_dashboard(
    db: Session = Depends(get_db), admin: User = Depends(get_current_admin)
):
    """
    Admin protected: Returns real calculated dashboard statistics and metrics.
    """
    return admin_service.get_dashboard_stats(db=db)


@router.get("/customers", response_model=List[UserResponse])
def get_all_customers(
    db: Session = Depends(get_db), admin: User = Depends(get_current_admin)
):
    """
    Admin protected: Lists all registered customer accounts.
    """
    return admin_service.get_all_customers(db=db)


@router.get("/reviews", response_model=List[ReviewResponse])
def get_all_reviews(
    db: Session = Depends(get_db), admin: User = Depends(get_current_admin)
):
    """
    Admin protected: Lists all submitted product reviews for moderation.
    """
    return admin_service.get_all_reviews(db=db)


@router.delete("/reviews/{review_id}")
def delete_review(
    review_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """
    Admin protected: Deletes an inappropriate product review.
    """
    success = review_service.delete_review_by_admin(db=db, review_id=review_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Review '{review_id}' not found.",
        )
    return {"message": "Review deleted successfully."}
