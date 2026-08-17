import uuid
from decimal import Decimal
from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.order import OrderCreate


def generate_order_number(db: Session) -> str:
    year = datetime.utcnow().year
    prefix = f"PYH-{year}-"
    last_order = (
        db.query(Order)
        .filter(Order.order_number.like(f"{prefix}%"))
        .order_by(Order.created_at.desc())
        .first()
    )
    if not last_order or not last_order.order_number:
        seq = 1
    else:
        try:
            parts = last_order.order_number.split("-")
            seq = int(parts[-1]) + 1
        except (ValueError, IndexError):
            seq = db.query(Order).count() + 1

    return f"{prefix}{seq:04d}"


def create_order(db: Session, order_in: OrderCreate) -> Order:
    try:
        order_num = generate_order_number(db)
        order_id = str(uuid.uuid4())

        order = Order(
            id=order_id,
            order_number=order_num,
            customer_name=order_in.customer_name.strip(),
            customer_email=order_in.customer_email.strip().lower(),
            customer_phone=order_in.customer_phone.strip(),
            shipping_address=order_in.shipping_address.strip(),
            status="Pending",
            total_amount=None,
        )
        db.add(order)

        total_sum = Decimal("0.00")
        has_null_price = False

        for item_in in order_in.items:
            product = db.query(Product).filter(Product.id == item_in.product_id).first()
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product '{item_in.product_id}' not found.",
                )

            if product.availability == "Coming Soon":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Product '{product.name}' is coming soon and cannot be ordered.",
                )

            if product.stock_quantity < item_in.quantity:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Insufficient stock for '{product.name}'. Requested: {item_in.quantity}, Available: {product.stock_quantity}.",
                )

            # Deduct stock safely
            product.stock_quantity -= item_in.quantity
            if product.stock_quantity == 0 and product.availability != "Coming Soon":
                product.availability = "Out of Stock"

            # Compute item price & totals using exact Decimal arithmetic
            unit_price = Decimal(str(product.price)) if product.price is not None else None
            if unit_price is not None:
                line_total = unit_price * Decimal(item_in.quantity)
                total_sum += line_total
            else:
                line_total = None
                has_null_price = True

            order_item = OrderItem(
                id=str(uuid.uuid4()),
                order_id=order_id,
                product_id=product.id,
                product_name=product.name,
                quantity=item_in.quantity,
                unit_price=unit_price,
                line_total=line_total,
            )
            db.add(order_item)

        order.total_amount = None if has_null_price else total_sum

        db.commit()
        db.refresh(order)
        return order
    except Exception:
        db.rollback()
        raise


def get_order(db: Session, order_identifier: str) -> Optional[Order]:
    return (
        db.query(Order)
        .filter((Order.id == order_identifier) | (Order.order_number == order_identifier))
        .first()
    )


def get_orders(db: Session) -> List[Order]:
    return db.query(Order).order_by(Order.created_at.desc()).all()


ALLOWED_TRANSITIONS = {
    "Pending": {"Confirmed", "Cancelled"},
    "Confirmed": {"Shipped", "Cancelled"},
    "Shipped": {"Delivered"},
    "Delivered": set(),
    "Cancelled": set(),
}


def update_order_status(db: Session, order_id: str, new_status: str) -> Order:
    valid_statuses = {"Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"}
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{new_status}'. Allowed values: {', '.join(sorted(valid_statuses))}",
        )

    order = get_order(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order '{order_id}' not found.",
        )

    if order.status == new_status:
        return order

    allowed_next = ALLOWED_TRANSITIONS.get(order.status, set())
    if new_status not in allowed_next:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status transition from '{order.status}' to '{new_status}'.",
        )

    # Perform stock restoration if cancelling a Pending or Confirmed order
    if order.status in {"Pending", "Confirmed"} and new_status == "Cancelled":
        for item in order.items:
            prod = db.query(Product).filter(Product.id == item.product_id).first()
            if prod:
                prod.stock_quantity += item.quantity
                if prod.stock_quantity > 0 and prod.availability != "Coming Soon":
                    prod.availability = "In Stock"

    order.status = new_status
    order.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(order)
    return order


def cancel_order_by_customer(db: Session, order_id: str) -> Order:
    """
    Customer-facing order cancellation: Allows cancelling only when order status is Pending or Confirmed.
    Restores stock exactly once and handles idempotency cleanly.
    """
    order = get_order(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order '{order_id}' not found.",
        )

    if order.status == "Cancelled":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Order is already cancelled.",
        )

    if order.status in {"Shipped", "Delivered"}:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot cancel an order that is already {order.status.lower()}.",
        )

    if order.status not in {"Pending", "Confirmed"}:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot cancel order in state '{order.status}'.",
        )

    # Perform stock restoration
    for item in order.items:
        prod = db.query(Product).filter(Product.id == item.product_id).first()
        if prod:
            prod.stock_quantity += item.quantity
            if prod.stock_quantity > 0 and prod.availability != "Coming Soon":
                prod.availability = "In Stock"

    order.status = "Cancelled"
    order.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(order)
    return order
