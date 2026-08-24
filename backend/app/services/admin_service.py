from decimal import Decimal
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.order import Order
from app.models.product import Product
from app.models.user import User
from app.models.review import Review


def get_dashboard_stats(db: Session) -> Dict[str, Any]:
    total_orders = db.query(Order).count()
    pending_orders = db.query(Order).filter(Order.status == "Pending").count()
    paid_orders = db.query(Order).filter(Order.payment_status == "Paid").count()
    total_customers = db.query(User).filter(User.is_admin == False).count()

    paid_orders_list = (
        db.query(Order)
        .filter(Order.payment_status == "Paid", Order.total_amount.isnot(None))
        .all()
    )
    total_revenue = sum(
        (o.total_amount for o in paid_orders_list if o.total_amount is not None),
        Decimal("0.00"),
    )

    low_stock_count = (
        db.query(Product)
        .filter(
            Product.stock_quantity > 0,
            Product.stock_quantity <= 3,
            Product.availability != "Coming Soon",
        )
        .count()
    )

    out_of_stock_count = (
        db.query(Product)
        .filter(
            Product.stock_quantity == 0,
            Product.availability != "Coming Soon",
        )
        .count()
    )

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
        "total_customers": total_customers,
        "total_revenue": total_revenue,
        "low_stock_count": low_stock_count,
        "out_of_stock_count": out_of_stock_count,
        "recent_orders": recent_orders,
    }


def get_all_customers(db: Session) -> List[User]:
    return db.query(User).filter(User.is_admin == False).order_by(User.created_at.desc()).all()


def get_all_reviews(db: Session) -> List[Review]:
    return db.query(Review).order_by(Review.created_at.desc()).all()
