import os
from pathlib import Path
from dotenv import load_dotenv

# Load backend/.env environment variables if present
env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.api.products import router as products_router
from app.api.orders import router as orders_router
from app.api.auth import router as auth_router
from app.api.payments import router as payments_router
from app.api.admin import router as admin_router
from app.api.location import router as location_router
from app.api.admin_locations import router as admin_locations_router
from app.db.database import engine, Base, SessionLocal

# Import models so Base metadata is aware of all tables before create_all
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.models.user import User
from app.models.payment import Payment
from app.models.delivery_location import DeliveryLocation
from app.services.auth_service import init_default_admin
from app.services.location_service import seed_default_locations

# Create missing database tables safely
Base.metadata.create_all(bind=engine)

# Safely add payment_status, pincode, city, state, delivery_charge, estimated_delivery_days columns to existing SQLite orders table if missing
with engine.connect() as conn:
    try:
        result = conn.execute(text("PRAGMA table_info(orders)")).fetchall()
        column_names = [row[1] for row in result]
        if "payment_status" not in column_names:
            conn.execute(text("ALTER TABLE orders ADD COLUMN payment_status VARCHAR DEFAULT 'Pending' NOT NULL"))
            conn.commit()
        if "pincode" not in column_names:
            conn.execute(text("ALTER TABLE orders ADD COLUMN pincode VARCHAR"))
            conn.commit()
        if "city" not in column_names:
            conn.execute(text("ALTER TABLE orders ADD COLUMN city VARCHAR"))
            conn.commit()
        if "state" not in column_names:
            conn.execute(text("ALTER TABLE orders ADD COLUMN state VARCHAR"))
            conn.commit()
        if "delivery_charge" not in column_names:
            conn.execute(text("ALTER TABLE orders ADD COLUMN delivery_charge NUMERIC(10,2) DEFAULT 0.00"))
            conn.commit()
        if "estimated_delivery_days" not in column_names:
            conn.execute(text("ALTER TABLE orders ADD COLUMN estimated_delivery_days INTEGER DEFAULT 3"))
            conn.commit()
    except Exception as e:
        print(f"Notice during migration check: {e}")

# Initialize default admin & default delivery locations on application startup
db = SessionLocal()
try:
    init_default_admin(db)
    seed_default_locations(db)
finally:
    db.close()

app = FastAPI(
    title="PYHARA Eco-Marketplace API",
    description="Backend API for PYHARA eco-friendly artisan crafts marketplace.",
    version="0.7.0",
)

from fastapi import Request, status
from fastapi.responses import JSONResponse

# Enable CORS for Vite local dev server (port 5173 / default localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Unhandled Server Exception at {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred while processing your request. Please try again."},
    )

app.include_router(products_router)
app.include_router(orders_router)
app.include_router(auth_router)
app.include_router(payments_router)
app.include_router(admin_router)
app.include_router(location_router)
app.include_router(admin_locations_router)


@app.get("/")
def read_root():
    return {
        "message": "Welcome to PYHARA Eco-Marketplace API",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
