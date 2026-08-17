from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


def get_products(db: Session) -> List[Product]:
    return db.query(Product).all()


def get_product_by_id(db: Session, product_id: str) -> Optional[Product]:
    return db.query(Product).filter(Product.id == product_id).first()


def compute_availability(availability: Optional[str], stock_quantity: int) -> str:
    if availability == "Coming Soon":
        return "Coming Soon"
    return "In Stock" if stock_quantity > 0 else "Out of Stock"


def create_product(db: Session, product: ProductCreate) -> Product:
    avail = compute_availability(product.availability, product.stock_quantity)

    db_product = Product(
        id=product.id,
        name=product.name,
        description=product.description,
        price=product.price,
        category=product.category,
        material=product.material,
        availability=avail,
        stock_quantity=product.stock_quantity,
        image=product.image,
        alt_text=product.alt_text,
        badge=product.badge,
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


def update_product(db: Session, product_id: str, product_update: ProductUpdate) -> Optional[Product]:
    db_product = get_product_by_id(db, product_id=product_id)
    if not db_product:
        return None

    update_data = product_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_product, field, value)

    # Re-evaluate availability semantics unless explicitly set to 'Coming Soon'
    target_avail = update_data.get("availability", db_product.availability)
    target_stock = update_data.get("stock_quantity", db_product.stock_quantity)
    db_product.availability = compute_availability(target_avail, target_stock)

    db.commit()
    db.refresh(db_product)
    return db_product


def delete_product(db: Session, product_id: str) -> bool:
    db_product = get_product_by_id(db, product_id=product_id)
    if not db_product:
        return False

    db.delete(db_product)
    db.commit()
    return True
