from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.product import Product
from app.schemas.product import ProductCreate


def get_products(db: Session) -> List[Product]:
    return db.query(Product).all()


def get_product_by_id(db: Session, product_id: str) -> Optional[Product]:
    return db.query(Product).filter(Product.id == product_id).first()


def create_product(db: Session, product: ProductCreate) -> Product:
    db_product = Product(
        id=product.id,
        name=product.name,
        description=product.description,
        price=product.price,
        category=product.category,
        material=product.material,
        availability=product.availability,
        image=product.image,
        alt_text=product.alt_text,
        badge=product.badge,
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product
