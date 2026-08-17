from sqlalchemy import Column, String, Numeric, Text, Integer
from app.db.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    price = Column(Numeric(10, 2), nullable=True)
    category = Column(String, nullable=True, index=True)
    material = Column(String, nullable=True)
    availability = Column(String, nullable=True)
    stock_quantity = Column(Integer, default=0, nullable=False)
    image = Column(String, nullable=True)
    alt_text = Column(String, nullable=True)
    badge = Column(String, nullable=True)
