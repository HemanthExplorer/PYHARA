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


DEFAULT_INITIAL_PRODUCTS = [
    {
        "id": "classic-ganesh",
        "name": "The Classic Ganesh",
        "category": "Ganesh Idols",
        "material": "Natural clay formulation",
        "description": "A traditional Ganesh idol design created with unbaked natural clay and simple traditional finishing.",
        "price": None,
        "availability": "Coming Soon",
        "stock_quantity": 0,
        "image": "/images/products/classic-ganesh.jpg",
        "alt_text": "Demonstration preview of The Classic Ganesh idol",
        "badge": "First Collection",
    },
    {
        "id": "earth-ganesh",
        "name": "The Earth Ganesh",
        "category": "Ganesh Idols",
        "material": "Earthen clay finish",
        "description": "An unadorned earthen clay idol showcasing the natural texture and shade of raw clay earth.",
        "price": None,
        "availability": "Coming Soon",
        "stock_quantity": 0,
        "image": "/images/products/earth-ganesh.jpg",
        "alt_text": "Demonstration preview of The Earth Ganesh idol",
        "badge": "First Collection",
    },
    {
        "id": "artisan-ganesh",
        "name": "The Artisan Ganesh",
        "category": "Ganesh Idols",
        "material": "Hand-molded clay",
        "description": "A finely detailed idol crafted using traditional hand-molding techniques passed down by heritage clay makers.",
        "price": None,
        "availability": "Coming Soon",
        "stock_quantity": 0,
        "image": "/images/products/artisan-ganesh.jpg",
        "alt_text": "Demonstration preview of The Artisan Ganesh idol",
        "badge": "First Collection",
    },
    {
        "id": "minimal-ganesh",
        "name": "The Minimal Ganesh",
        "category": "Ganesh Idols",
        "material": "Contemporary sculpted clay",
        "description": "A clean, contemporary interpretation featuring simplified geometric lines in natural sculpted clay.",
        "price": None,
        "availability": "Coming Soon",
        "stock_quantity": 0,
        "image": "/images/products/minimal-ganesh.jpg",
        "alt_text": "Demonstration preview of The Minimal Ganesh idol",
        "badge": "First Collection",
    },
]


def seed_default_products(db: Session) -> None:
    """
    Safely seeds initial default catalog products IF AND ONLY IF the products table is completely empty.
    If any products exist (such as admin added or edited products), seeding is skipped.
    """
    if db.query(Product).count() > 0:
        return

    for item in DEFAULT_INITIAL_PRODUCTS:
        db_product = Product(**item)
        db.add(db_product)
    db.commit()

