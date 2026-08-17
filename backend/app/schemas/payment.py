from decimal import Decimal
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class PaymentOrderCreate(BaseModel):
    order_id: str = Field(..., min_length=1)


class PaymentOrderResponse(BaseModel):
    order_id: str
    razorpay_order_id: str
    amount: int  # Amount in paise (integer)
    currency: str = "INR"
    key_id: str
    is_mock: bool = False


class PaymentVerifyRequest(BaseModel):
    order_id: str = Field(..., min_length=1)
    razorpay_order_id: str = Field(..., min_length=1)
    razorpay_payment_id: str = Field(..., min_length=1)
    razorpay_signature: str = Field(..., min_length=1)


class PaymentVerifyResponse(BaseModel):
    status: str
    payment_status: str
    message: str
    order_id: str


class PaymentResponse(BaseModel):
    id: str
    order_id: str
    razorpay_order_id: str
    razorpay_payment_id: Optional[str] = None
    amount: Decimal
    currency: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
