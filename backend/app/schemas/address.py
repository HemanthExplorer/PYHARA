from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, field_validator


class AddressBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=10, max_length=15)
    address_line: str = Field(..., min_length=5)
    city: str = Field(..., min_length=2)
    state: str = Field(..., min_length=2)
    pincode: str = Field(..., min_length=6, max_length=6)
    country: str = Field("India", min_length=2)
    label: str = Field("Home", min_length=1)  # Home, Work, Other
    is_default: bool = False

    @field_validator("pincode")
    @classmethod
    def validate_pincode(cls, v: str) -> str:
        clean = v.strip()
        if not clean.isdigit() or len(clean) != 6:
            raise ValueError("Indian PIN code must be exactly 6 numeric digits.")
        return clean


class AddressCreate(AddressBase):
    pass


class AddressUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address_line: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    country: Optional[str] = None
    label: Optional[str] = None
    is_default: Optional[bool] = None


class AddressResponse(AddressBase):
    id: str
    user_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
