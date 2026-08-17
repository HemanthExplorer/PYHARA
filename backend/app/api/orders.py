from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.order import OrderCreate, OrderResponse, OrderStatusUpdate
from app.services import order_service
from app.core.deps import get_current_admin
from app.models.user import User

router = APIRouter(prefix="/api/orders", tags=["Orders"])


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order_in: OrderCreate, db: Session = Depends(get_db)):
    """
    Public customer checkout: Creates a new order. Transactionally validates product availability and stock,
    snapshots item prices/names, and deducts inventory stock.
    """
    return order_service.create_order(db=db, order_in=order_in)


@router.get("", response_model=List[OrderResponse])
def get_admin_orders(
    db: Session = Depends(get_db), admin: User = Depends(get_current_admin)
):
    """
    Admin protected: Returns all orders sorted newest first.
    """
    return order_service.get_orders(db=db)


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: str, db: Session = Depends(get_db)):
    """
    Public / Customer order confirmation lookup: Retrieves a single order by ID or order_number.
    """
    order = order_service.get_order(db=db, order_identifier=order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order '{order_id}' not found.",
        )
    return order


@router.put("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: str,
    status_update: OrderStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """
    Admin protected: Updates order status enforcing valid state transitions. Restores inventory if order is cancelled.
    """
    return order_service.update_order_status(
        db=db, order_id=order_id, new_status=status_update.status
    )
