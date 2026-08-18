import uuid
from datetime import datetime
from sqlalchemy import Column, String, Numeric, Text, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    order_number = Column(String, unique=True, index=True, nullable=False)
    customer_name = Column(String, nullable=False)
    customer_email = Column(String, nullable=False)
    customer_phone = Column(String, nullable=False)
    shipping_address = Column(Text, nullable=False)
    pincode = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    delivery_charge = Column(Numeric(10, 2), default=0.00, nullable=True)
    estimated_delivery_days = Column(Integer, default=3, nullable=True)
    status = Column(String, default="Pending", nullable=False)
    payment_status = Column(String, default="Pending", nullable=False)  # Pending, Paid, Failed
    total_amount = Column(Numeric(12, 2), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String, ForeignKey("orders.id"), nullable=False, index=True)
    product_id = Column(String, nullable=False, index=True)
    product_name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=True)
    line_total = Column(Numeric(12, 2), nullable=True)

    order = relationship("Order", back_populates="items")
