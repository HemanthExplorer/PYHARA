import re
from decimal import Decimal
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator

PINCODE_REGEX = re.compile(r"^[1-9][0-9]{5}$")


class DeliveryLocationBase(BaseModel):
    pincode: str = Field(..., min_length=6, max_length=6)
    city: str = Field(..., min_length=1)
    state: str = Field(..., min_length=1)
    is_active: bool = True
    delivery_charge: Decimal = Field(default=Decimal("0.00"), ge=0)
    estimated_delivery_days: int = Field(default=3, ge=1)
    notes: Optional[str] = None

    @field_validator("pincode")
    @classmethod
    def validate_pincode_format(cls, v: str) -> str:
        clean_v = v.strip()
        if not PINCODE_REGEX.match(clean_v):
            raise ValueError(f"Invalid PIN code '{v}'. Must be a 6-digit Indian postal code starting with 1-9.")
        return clean_v


class DeliveryLocationCreate(DeliveryLocationBase):
    pass


class DeliveryLocationUpdate(BaseModel):
    city: Optional[str] = None
    state: Optional[str] = None
    is_active: Optional[bool] = None
    delivery_charge: Optional[Decimal] = Field(default=None, ge=0)
    estimated_delivery_days: Optional[int] = Field(default=None, ge=1)
    notes: Optional[str] = None


class DeliveryLocationResponse(DeliveryLocationBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ServiceabilityResponse(BaseModel):
    serviceable: bool
    pincode: str
    city: Optional[str] = None
    state: Optional[str] = None
    delivery_charge: Decimal = Decimal("0.00")
    estimated_delivery_days: int = 3
    reason: Optional[str] = None
    message: str
