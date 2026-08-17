from sqlalchemy import Column, String, Float, Text
from app.db.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=True)
    category = Column(String, nullable=True, index=True)
    material = Column(String, nullable=True)
    availability = Column(String, nullable=True)
    image = Column(String, nullable=True)
    alt_text = Column(String, nullable=True)
    badge = Column(String, nullable=True)
