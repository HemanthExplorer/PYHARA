from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.core.deps import get_current_user, get_current_admin
from app.schemas.order import OrderCreate, OrderResponse, OrderStatusUpdate
from app.services import order_service

router = APIRouter(prefix="/api/orders", tags=["Orders"])


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Authenticated customer endpoint: Places a new order.
    """
    return order_service.create_order(db=db, order_in=order_in, user_id=current_user.id)


@router.get("/my-orders", response_model=List[OrderResponse])
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Authenticated customer endpoint: Retrieves order history for current customer.
    """
    return order_service.get_user_orders(db=db, user_id=current_user.id)


@router.get("", response_model=List[OrderResponse])
def get_all_orders(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """
    Admin protected endpoint: Lists all orders across all customers.
    """
    return order_service.get_orders(db=db)


@router.get("/{order_identifier}", response_model=OrderResponse)
def get_order_by_id_or_number(
    order_identifier: str,
    db: Session = Depends(get_db),
):
    """
    Public/Customer endpoint: Retrieves order details by order ID or PYH order number (for tracking).
    """
    order = order_service.get_order(db=db, order_identifier=order_identifier)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order '{order_identifier}' not found.",
        )
    return order


@router.put("/{order_id}/cancel", response_model=OrderResponse)
def cancel_order(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Customer endpoint: Cancels a Pending or Confirmed order and restores stock.
    """
    return order_service.cancel_order_by_customer(db=db, order_id=order_id)


@router.put("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: str,
    status_in: OrderStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """
    Admin protected endpoint: Updates order status (Pending -> Confirmed -> Shipped -> Delivered / Cancelled).
    """
    return order_service.update_order_status(db=db, order_id=order_id, new_status=status_in.status)


@router.put("/{order_id}/mark-cod-paid", response_model=OrderResponse)
def mark_cod_paid(
    order_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """
    Admin protected endpoint: Marks a Cash on Delivery order as Paid upon cash collection.
    """
    return order_service.mark_cod_order_as_paid(db=db, order_id=order_id)
