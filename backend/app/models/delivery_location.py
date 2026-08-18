import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Numeric, Integer, Text, DateTime
from app.db.database import Base


class DeliveryLocation(Base):
    __tablename__ = "delivery_locations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    pincode = Column(String, unique=True, index=True, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    delivery_charge = Column(Numeric(10, 2), default=0.00, nullable=False)
    estimated_delivery_days = Column(Integer, default=3, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
