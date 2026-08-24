from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.order import OrderCreate, OrderResponse, OrderStatusUpdate
from app.services import order_service
from app.core.deps import get_current_admin, get_current_user, oauth2_scheme
from app.core.security import decode_access_token
from app.services import auth_service
from app.models.user import User

router = APIRouter(prefix="/api/orders", tags=["Orders"])


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme),
):
    """
    Customer checkout: Creates a new order. Associates user_id if token is supplied.
    Transactionally validates product availability and stock, snapshots item prices/names, and deducts inventory.
    """
    user_id = None
    if token:
        payload = decode_access_token(token)
        if payload and payload.get("sub"):
            user = auth_service.get_user_by_username(db, username=payload.get("sub"))
            if user:
                user_id = user.id

    return order_service.create_order(db=db, order_in=order_in, user_id=user_id)


@router.get("/my-orders", response_model=List[OrderResponse])
def get_customer_my_orders(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """
    Authenticated customer: Returns personal order history.
    """
    return order_service.get_user_orders(db=db, user_id=current_user.id)


@router.get("", response_model=List[OrderResponse])
def get_admin_orders(
    db: Session = Depends(get_db), admin: User = Depends(get_current_admin)
):
    """
    Admin protected: Returns all marketplace orders sorted newest first.
    """
    return order_service.get_orders(db=db)


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: str, db: Session = Depends(get_db)):
    """
    Public / Customer order tracking lookup: Retrieves a single order by ID or order_number.
    """
    order = order_service.get_order(db=db, order_identifier=order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order '{order_id}' not found.",
        )
    return order


@router.put("/{order_id}/cancel", response_model=OrderResponse)
def cancel_customer_order(order_id: str, db: Session = Depends(get_db)):
    """
    Customer-facing order cancellation: Allows cancelling pending/confirmed orders and restores inventory.
    """
    return order_service.cancel_order_by_customer(db=db, order_id=order_id)


@router.put("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: str,
    status_update: OrderStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """
    Admin protected: Updates order status enforcing valid state transitions.
    """
    return order_service.update_order_status(
        db=db, order_id=order_id, new_status=status_update.status
    )


@router.put("/{order_id}/mark-cod-paid", response_model=OrderResponse)
def mark_cod_paid(
    order_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """
    Admin protected: Marks a Cash on Delivery (COD) order as Paid.
    """
    return order_service.mark_cod_order_as_paid(db=db, order_id=order_id)
