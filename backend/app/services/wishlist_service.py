import uuid
from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.wishlist import Wishlist
from app.models.product import Product


def get_user_wishlist(db: Session, user_id: str) -> List[Wishlist]:
    return (
        db.query(Wishlist)
        .filter(Wishlist.user_id == user_id)
        .order_by(Wishlist.created_at.desc())
        .all()
    )


def add_to_wishlist(db: Session, user_id: str, product_id: str) -> Wishlist:
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product '{product_id}' not found.",
        )

    existing = (
        db.query(Wishlist)
        .filter(Wishlist.user_id == user_id, Wishlist.product_id == product_id)
        .first()
    )
    if existing:
        return existing

    item = Wishlist(
        id=str(uuid.uuid4()),
        user_id=user_id,
        product_id=product_id,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def remove_from_wishlist(db: Session, user_id: str, product_id: str) -> bool:
    item = (
        db.query(Wishlist)
        .filter(Wishlist.user_id == user_id, Wishlist.product_id == product_id)
        .first()
    )
    if not item:
        return False

    db.delete(item)
    db.commit()
    return True
