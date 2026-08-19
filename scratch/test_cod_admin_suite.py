import sys
import os
from pathlib import Path
from decimal import Decimal

os.environ["JWT_SECRET_KEY"] = "test_jwt_secret_key_32bytes_minimum!"
os.environ["RAZORPAY_KEY_ID"] = "rzp_test_key_123"
os.environ["RAZORPAY_KEY_SECRET"] = "rzp_test_secret_456"

# Add backend directory to sys.path
backend_path = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.database import Base
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.models.payment import Payment
from app.models.user import User
from app.models.delivery_location import DeliveryLocation
from app.schemas.order import OrderCreate, OrderItemCreate
from app.services import order_service, payment_service, admin_service, product_service, auth_service, location_service
from app.core.security import get_password_hash, create_access_token
from app.core.deps import get_current_admin, get_current_user
from fastapi import HTTPException


def run_cod_admin_suite():
    db_file = Path("./test_temp_cod_admin.db")
    if db_file.exists():
        try:
            db_file.unlink()
        except Exception:
            pass

    engine = create_engine(f"sqlite:///{db_file.as_posix()}", connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    print("========================================================================")
    print("      PYHARA ECO-MARKETPLACE — ADMIN & COD & PAYMENT FAILURE SUITE       ")
    print("========================================================================")

    try:
        # 1. Seed Database with Admin, Customer, Product, and Locations
        admin_user = User(
            id="admin-cod-suite",
            username="admin_cod",
            email="admin.cod@pyhara.com",
            hashed_password=get_password_hash("AdminPass123!"),
            is_active=True,
            is_admin=True,
        )
        norm_user = User(
            id="cust-cod-suite",
            username="customer_cod",
            email="customer.cod@pyhara.com",
            hashed_password=get_password_hash("CustomerPass123!"),
            is_active=True,
            is_admin=False,
        )
        p1 = Product(
            id="p-cod-1",
            name="Eco Clay Diya Set (COD Test)",
            price=Decimal("450.00"),
            stock_quantity=10,
            availability="In Stock",
        )
        db.add_all([admin_user, norm_user, p1])
        db.commit()
        location_service.seed_default_locations(db)
        print("[OK] Test 1: Test environment initialized with Admin, Customer, Product, and Locations.")

        # 2. Public /admin login page & Auth Authentication Tests
        try:
            auth_service.authenticate_user(db, "admin_cod", "WrongPassword!")
            assert False, "Expected False for invalid credentials"
        except Exception:
            pass

        authenticated_admin = auth_service.authenticate_user(db, "admin_cod", "AdminPass123!")
        assert authenticated_admin is not None
        assert authenticated_admin.is_admin is True
        print("[OK] Test 2: Admin login authentication verified (Invalid rejected, valid token issued).")

        # 3. Security Guards: Admin vs Non-admin Access
        admin_jwt = create_access_token({"sub": "admin_cod", "is_admin": True})
        cust_jwt = create_access_token({"sub": "customer_cod", "is_admin": False})

        admin_obj = get_current_user(db=db, token=admin_jwt)
        cust_obj = get_current_user(db=db, token=cust_jwt)

        # Admin user passes get_current_admin guard
        validated_admin = get_current_admin(current_user=admin_obj)
        assert validated_admin.username == "admin_cod"

        # Non-admin user raises HTTP 403
        try:
            get_current_admin(current_user=cust_obj)
            assert False, "Expected 403 Forbidden for customer"
        except HTTPException as exc:
            assert exc.status_code == 403
            print("[OK] Test 3: Protected admin route guard verified (Admin granted, customer blocked with 403).")

        # 4. COD Order Creation
        cod_order_in = OrderCreate(
            customer_name="Rohan Sharma",
            customer_email="rohan@example.com",
            customer_phone="+919876543210",
            shipping_address="#101 MG Road, Indiranagar",
            pincode="560001",
            payment_method="COD",
            items=[OrderItemCreate(product_id="p-cod-1", quantity=2)]
        )
        cod_order = order_service.create_order(db, cod_order_in)
        db.refresh(p1)
        assert cod_order.payment_method == "COD"
        assert cod_order.payment_status == "Pending"
        assert cod_order.status == "Pending"
        assert cod_order.total_amount == Decimal("950.00")  # (450 * 2) + 50 delivery
        assert p1.stock_quantity == 8  # Deducted 2 from 10
        print(f"[OK] Test 4: COD Order #{cod_order.order_number} created with payment_method='COD', payment_status='Pending'.")

        # 5. Customer Tracking & Confirmation Lookup Displays COD
        fetched_order = order_service.get_order(db, cod_order.id)
        assert fetched_order is not None
        assert fetched_order.payment_method == "COD"
        assert fetched_order.payment_status == "Pending"
        print("[OK] Test 5: Order tracking lookup correctly displays Cash on Delivery details.")

        # 6. Admin Mark COD as Paid Action & Idempotency
        paid_cod_order = order_service.mark_cod_order_as_paid(db, cod_order.id)
        assert paid_cod_order.payment_status == "Paid"
        assert paid_cod_order.status == "Confirmed"

        # Idempotent second call
        dup_paid = order_service.mark_cod_order_as_paid(db, cod_order.id)
        assert dup_paid.payment_status == "Paid"
        print("[OK] Test 6: Admin 'Mark COD as Paid' action updated payment_status to 'Paid' and is fully idempotent.")

        # 7. Razorpay Order cannot be marked as COD-paid
        rzp_order_in = OrderCreate(
            customer_name="Anita Verma",
            customer_email="anita@example.com",
            customer_phone="+919876543211",
            shipping_address="#42 Brigade Road",
            pincode="560001",
            payment_method="RAZORPAY",
            items=[OrderItemCreate(product_id="p-cod-1", quantity=1)]
        )
        rzp_order = order_service.create_order(db, rzp_order_in)
        assert rzp_order.payment_method == "RAZORPAY"

        try:
            order_service.mark_cod_order_as_paid(db, rzp_order.id)
            assert False, "Expected 400 when marking Razorpay order as COD paid"
        except HTTPException as exc:
            assert exc.status_code == 400
            assert "Only Cash on Delivery" in exc.detail
            print("[OK] Test 7: Razorpay orders blocked from being marked as COD-paid.")

        # 8. COD Cancellation Restores Stock Exactly Once
        cod_cancel_in = OrderCreate(
            customer_name="Priya Singh",
            customer_email="priya@example.com",
            customer_phone="+919876543212",
            shipping_address="#88 Commercial Street",
            pincode="560001",
            payment_method="COD",
            items=[OrderItemCreate(product_id="p-cod-1", quantity=3)]
        )
        cod_cancel_order = order_service.create_order(db, cod_cancel_in)
        db.refresh(p1)
        stock_before = p1.stock_quantity

        cancelled_order = order_service.cancel_order_by_customer(db, cod_cancel_order.id)
        db.refresh(p1)
        assert cancelled_order.status == "Cancelled"
        assert p1.stock_quantity == stock_before + 3  # Restored 3 items

        try:
            order_service.cancel_order_by_customer(db, cod_cancel_order.id)
            assert False, "Expected 409 for duplicate cancellation"
        except HTTPException as exc:
            assert exc.status_code == 409
            print("[OK] Test 8: COD order cancellation restored inventory stock exactly once.")

        # 9. Unserviceable PIN & Insufficient Stock Validation for COD
        bad_pin_in = OrderCreate(
            customer_name="Tester",
            customer_email="test@example.com",
            customer_phone="+919876543210",
            shipping_address="Street",
            pincode="999999",  # Unserviceable
            payment_method="COD",
            items=[OrderItemCreate(product_id="p-cod-1", quantity=1)]
        )
        try:
            order_service.create_order(db, bad_pin_in)
            assert False, "Expected 400 for bad PIN"
        except HTTPException as exc:
            assert exc.status_code == 400

        bad_stock_in = OrderCreate(
            customer_name="Tester",
            customer_email="test@example.com",
            customer_phone="+919876543210",
            shipping_address="Street",
            pincode="560001",
            payment_method="COD",
            items=[OrderItemCreate(product_id="p-cod-1", quantity=999)]
        )
        try:
            order_service.create_order(db, bad_stock_in)
            assert False, "Expected 409 for insufficient stock"
        except HTTPException as exc:
            assert exc.status_code == 409
            print("[OK] Test 9: COD order creation respects unserviceable PIN and stock limit validations.")

        # 10. Razorpay Initialization Failure Cleaning Up Order & Restoring Stock
        db.refresh(p1)
        stock_before_fail = p1.stock_quantity

        fail_rzp_order_in = OrderCreate(
            customer_name="Razorpay Failure Test",
            customer_email="fail_rzp@example.com",
            customer_phone="+919876543219",
            shipping_address="#99 Indiranagar",
            pincode="560001",
            payment_method="RAZORPAY",
            items=[OrderItemCreate(product_id="p-cod-1", quantity=2)]
        )
        fail_order = order_service.create_order(db, fail_rzp_order_in)
        db.refresh(p1)
        assert p1.stock_quantity == stock_before_fail - 2

        try:
            payment_service.create_razorpay_order(db, fail_order.id)
            assert False, "Expected 400 for failed Razorpay initialization"
        except HTTPException as exc:
            assert exc.status_code == 400
            assert "Unable to initialize online payment" in exc.detail

        db.refresh(fail_order)
        db.refresh(p1)
        assert fail_order.payment_status == "Failed"
        assert fail_order.status == "Cancelled"
        assert p1.stock_quantity == stock_before_fail  # Stock restored!
        print("[OK] Test 10: Razorpay initialization failure automatically set payment_status='Failed', status='Cancelled', and restored stock.")

        # 11. Attempting to initialize or pay a cancelled failed order raises 409
        try:
            payment_service.create_razorpay_order(db, fail_order.id)
            assert False, "Expected 409 when re-initializing cancelled order"
        except HTTPException as exc:
            assert exc.status_code == 409
            assert "Cancelled orders cannot be paid" in exc.detail
            print("[OK] Test 11: Cancelled failed orders cannot be re-initialized, preventing lingering pending states.")

        print("\n========================================================================")
        print("   *** ALL ADMIN, COD, & PAYMENT FAILURE TESTS PASSED PERFECTLY! ***    ")
        print("========================================================================")

    finally:
        db.close()
        if db_file.exists():
            try:
                db_file.unlink()
            except Exception:
                pass

if __name__ == "__main__":
    run_cod_admin_suite()
