import re
from decimal import Decimal
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator

PINCODE_REGEX = re.compile(r"^[1-9][0-9]{5}$")
PHONE_REGEX = re.compile(r"^(\+91[\-\s]?)?[6-9]\d{9}$")
EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")


class OrderItemCreate(BaseModel):
    product_id: str = Field(..., min_length=1)
    quantity: int = Field(..., gt=0)


class OrderCreate(BaseModel):
    customer_name: str = Field(..., min_length=2)
    customer_email: str = Field(..., min_length=3)
    customer_phone: str = Field(..., min_length=10)
    shipping_address: str = Field(..., min_length=5)
    pincode: Optional[str] = Field(default=None)
    city: Optional[str] = Field(default=None)
    state: Optional[str] = Field(default=None)
    items: List[OrderItemCreate] = Field(..., min_length=1)

    @field_validator("customer_name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        clean_v = v.strip()
        if len(clean_v) < 2:
            raise ValueError("Customer name must be at least 2 characters.")
        return clean_v

    @field_validator("customer_email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        clean_v = v.strip()
        if not EMAIL_REGEX.match(clean_v):
            raise ValueError(f"Invalid email address format: '{v}'")
        return clean_v

    @field_validator("customer_phone")
    @classmethod
    def validate_phone_format(cls, v: str) -> str:
        clean_v = v.strip()
        # Remove common spaces or hyphens for regex matching
        digits_only = re.sub(r"[\s\-]", "", clean_v)
        if not PHONE_REGEX.match(digits_only):
            raise ValueError(f"Invalid phone number format: '{v}'. Must be a valid 10-digit Indian phone number.")
        return clean_v

    @field_validator("pincode")
    @classmethod
    def validate_pincode_format(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        clean_v = v.strip()
        if not PINCODE_REGEX.match(clean_v):
            raise ValueError(f"Invalid PIN code: '{v}'. Must be a valid 6-digit Indian postal code.")
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
    unit_price: Optional[Decimal] = None
    line_total: Optional[Decimal] = None

    model_config = ConfigDict(from_attributes=True)


class OrderResponse(BaseModel):
    id: str
    order_number: str
    customer_name: str
    customer_email: str
    customer_phone: str
    shipping_address: str
    pincode: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    delivery_charge: Optional[Decimal] = Decimal("0.00")
    estimated_delivery_days: Optional[int] = 3
    status: str
    payment_status: str = "Pending"
    total_amount: Optional[Decimal] = None
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []

    model_config = ConfigDict(from_attributes=True)


class OrderStatusUpdate(BaseModel):
    status: str = Field(..., min_length=1)
