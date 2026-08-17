from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.payment import (
    PaymentOrderCreate,
    PaymentOrderResponse,
    PaymentVerifyRequest,
    PaymentVerifyResponse,
    PaymentResponse,
)
from app.services import payment_service

router = APIRouter(prefix="/api/payments", tags=["Payments"])


@router.post("/create-order", response_model=PaymentOrderResponse)
def create_payment_order(
    payload: PaymentOrderCreate, db: Session = Depends(get_db)
):
    """
    Creates a Razorpay Test Mode payment order for a PYHARA order.
    Validates order status, converts total amount to integer paise, and returns client payment details.
    """
    res = payment_service.create_razorpay_order(db=db, order_id=payload.order_id)
    return PaymentOrderResponse(
        order_id=res["order_id"],
        razorpay_order_id=res["razorpay_order_id"],
        amount=res["amount"],
        currency=res["currency"],
        key_id=res["key_id"],
    )


@router.post("/verify", response_model=PaymentVerifyResponse)
def verify_payment(
    payload: PaymentVerifyRequest, db: Session = Depends(get_db)
):
    """
    Verifies Razorpay HMAC SHA256 payment signature using RAZORPAY_KEY_SECRET.
    Updates Payment status to Paid and Order payment_status/status to Paid/Confirmed upon success.
    """
    res = payment_service.verify_payment_signature(
        db=db,
        order_id=payload.order_id,
        razorpay_order_id=payload.razorpay_order_id,
        razorpay_payment_id=payload.razorpay_payment_id,
        razorpay_signature=payload.razorpay_signature,
    )
    return PaymentVerifyResponse(
        status=res["status"],
        payment_status=res["payment_status"],
        message=res["message"],
        order_id=res["order_id"],
    )


@router.get("/order/{order_id}", response_model=PaymentResponse)
def get_payment_for_order(order_id: str, db: Session = Depends(get_db)):
    """
    Retrieves latest payment record details for a specific PYHARA order ID.
    """
    pmt = payment_service.get_payment_by_order_id(db=db, order_id=order_id)
    if not pmt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No payment record found for order '{order_id}'.",
        )
    return pmt
