from typing import Optional
from pydantic import BaseModel, ConfigDict


class ProductBase(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    material: Optional[str] = None
    availability: Optional[str] = None
    image: Optional[str] = None
    alt_text: Optional[str] = None
    badge: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    material: Optional[str] = None
    availability: Optional[str] = None
    image: Optional[str] = None
    alt_text: Optional[str] = None
    badge: Optional[str] = None


class Product(ProductBase):
    model_config = ConfigDict(from_attributes=True)
