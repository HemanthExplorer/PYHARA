import uuid
from typing import List, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.review import Review
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.review import ReviewCreate


def get_product_reviews(db: Session, product_id: str) -> List[Review]:
    return (
        db.query(Review)
        .filter(Review.product_id == product_id)
        .order_by(Review.created_at.desc())
        .all()
    )


def get_product_rating_summary(db: Session, product_id: str) -> Dict[str, Any]:
    stats = (
        db.query(
            func.count(Review.id).label("count"),
            func.avg(Review.rating).label("avg_rating"),
        )
        .filter(Review.product_id == product_id)
        .first()
    )

    review_count = stats.count if stats else 0
    avg_rating = round(float(stats.avg_rating), 1) if stats and stats.avg_rating else 0.0

    return {
        "product_id": product_id,
        "review_count": review_count,
        "average_rating": avg_rating,
    }


def create_review(
    db: Session, product_id: str, user_id: str, user_name: str, review_in: ReviewCreate
) -> Review:
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product '{product_id}' not found.",
        )

    # Check if user already reviewed this product
    existing = (
        db.query(Review)
        .filter(Review.product_id == product_id, Review.user_id == user_id)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted a review for this product.",
        )

    # Check if customer has purchased this product (is_verified_buyer)
    verified = (
        db.query(OrderItem)
        .join(Order, OrderItem.order_id == Order.id)
        .filter(
            OrderItem.product_id == product_id,
            Order.user_id == user_id,
            Order.status.in_(["Pending", "Confirmed", "Shipped", "Delivered"]),
        )
        .first()
    ) is not None


    review = Review(
        id=str(uuid.uuid4()),
        product_id=product_id,
        user_id=user_id,
        user_name=user_name,
        rating=review_in.rating,
        comment=review_in.comment.strip(),
        is_verified_buyer=verified,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


def delete_review_by_admin(db: Session, review_id: str) -> bool:
    rev = db.query(Review).filter(Review.id == review_id).first()
    if not rev:
        return False
    db.delete(rev)
    db.commit()
    return True
