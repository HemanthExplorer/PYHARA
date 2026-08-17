import re
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")


class OrderItemCreate(BaseModel):
    product_id: str = Field(..., min_length=1)
    quantity: int = Field(..., gt=0)


class OrderCreate(BaseModel):
    customer_name: str = Field(..., min_length=1)
    customer_email: str = Field(..., min_length=3)
    customer_phone: str = Field(..., min_length=1)
    shipping_address: str = Field(..., min_length=1)
    items: List[OrderItemCreate] = Field(..., min_length=1)

    @field_validator("customer_email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        clean_v = v.strip()
        if not EMAIL_REGEX.match(clean_v):
            raise ValueError(f"Invalid email address format: '{v}'")
        return clean_v

    @field_validator("items")
    @classmethod
    def validate_no_duplicate_products(cls, items: List[OrderItemCreate]) -> List[OrderItemCreate]:
        seen = set()
        for item in items:
            if item.product_id in seen:
                raise ValueError(f"Duplicate product_id in order items: '{item.product_id}'")
            seen.add(item.product_id)
        return items


class OrderItemResponse(BaseModel):
    id: str
    order_id: str
    product_id: str
    product_name: str
    quantity: int
    unit_price: Optional[float] = None
    line_total: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)


class OrderResponse(BaseModel):
    id: str
    order_number: str
    customer_name: str
    customer_email: str
    customer_phone: str
    shipping_address: str
    status: str
    total_amount: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []

    model_config = ConfigDict(from_attributes=True)


class OrderStatusUpdate(BaseModel):
    status: str = Field(..., min_length=1)
