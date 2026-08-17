from decimal import Decimal
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.order import Order
from app.models.product import Product


def get_dashboard_stats(db: Session) -> Dict[str, Any]:
    # 1. Total order metrics
    total_orders = db.query(Order).count()
    pending_orders = db.query(Order).filter(Order.status == "Pending").count()
    paid_orders = db.query(Order).filter(Order.payment_status == "Paid").count()

    # 2. Total revenue (sum of Paid orders where total_amount is not None)
    paid_orders_list = (
        db.query(Order)
        .filter(Order.payment_status == "Paid", Order.total_amount.isnot(None))
        .all()
    )
    total_revenue = sum(
        (o.total_amount for o in paid_orders_list if o.total_amount is not None),
        Decimal("0.00"),
    )

    # 3. Low stock (stock_quantity > 0 and stock_quantity <= 3, exclude Coming Soon)
    low_stock_count = (
        db.query(Product)
        .filter(
            Product.stock_quantity > 0,
            Product.stock_quantity <= 3,
            Product.availability != "Coming Soon",
        )
        .count()
    )

    # 4. Out of stock (stock_quantity == 0, exclude Coming Soon)
    out_of_stock_count = (
        db.query(Product)
        .filter(
            Product.stock_quantity == 0,
            Product.availability != "Coming Soon",
        )
        .count()
    )

    # 5. Recent orders (top 10 newest orders)
    recent_orders = (
        db.query(Order)
        .order_by(Order.created_at.desc())
        .limit(10)
        .all()
    )

    return {
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "paid_orders": paid_orders,
        "total_revenue": total_revenue,
        "low_stock_count": low_stock_count,
        "out_of_stock_count": out_of_stock_count,
        "recent_orders": recent_orders,
    }
