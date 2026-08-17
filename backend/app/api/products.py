from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.product import Product, ProductCreate, ProductUpdate
from app.services import product_service
from app.core.deps import get_current_admin
from app.models.user import User

router = APIRouter(prefix="/api/products", tags=["Products"])


@router.get("", response_model=List[Product])
def get_products(db: Session = Depends(get_db)):
    """
    Public endpoint: Retrieves all products in the catalog.
    """
    return product_service.get_products(db)


@router.get("/{product_id}", response_model=Product)
def get_product(product_id: str, db: Session = Depends(get_db)):
    """
    Public endpoint: Retrieves a single product by ID.
    """
    product = product_service.get_product_by_id(db, product_id=product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' not found.",
        )
    return product


@router.post("", response_model=Product, status_code=status.HTTP_201_CREATED)
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """
    Admin protected: Creates a new product.
    """
    existing_product = product_service.get_product_by_id(db, product_id=product_in.id)
    if existing_product:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product with ID '{product_in.id}' already exists.",
        )

    return product_service.create_product(db, product=product_in)


@router.put("/{product_id}", response_model=Product)
def update_product(
    product_id: str,
    product_update: ProductUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """
    Admin protected: Updates an existing product.
    """
    updated_product = product_service.update_product(
        db, product_id=product_id, product_update=product_update
    )
    if not updated_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' not found.",
        )
    return updated_product


@router.delete("/{product_id}")
def delete_product(
    product_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """
    Admin protected: Deletes a product.
    """
    success = product_service.delete_product(db, product_id=product_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' not found.",
        )
    return {"message": f"Product '{product_id}' successfully deleted."}
