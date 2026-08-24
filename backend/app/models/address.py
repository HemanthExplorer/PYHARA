import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from app.db.database import Base


class Address(Base):
    __tablename__ = "addresses"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    address_line = Column(Text, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    pincode = Column(String, nullable=False, index=True)
    country = Column(String, default="India", nullable=False)
    label = Column(String, default="Home", nullable=False)  # Home, Work, Other
    is_default = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
