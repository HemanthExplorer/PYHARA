from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.product import Product as ProductSchema, ProductCreate
from app.services import product_service

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("", response_model=List[ProductSchema])
@router.get("/", response_model=List[ProductSchema], include_in_schema=False)
def read_products(db: Session = Depends(get_db)):
    return product_service.get_products(db)


@router.get("/{product_id}", response_model=ProductSchema)
def read_product(product_id: str, db: Session = Depends(get_db)):
    db_product = product_service.get_product_by_id(db, product_id=product_id)
    if db_product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )
    return db_product


@router.post("", response_model=ProductSchema, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=ProductSchema, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    existing = product_service.get_product_by_id(db, product_id=product.id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product with this ID already exists",
        )
    return product_service.create_product(db, product=product)
