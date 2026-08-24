import os
from pathlib import Path
from dotenv import load_dotenv

# Load backend/.env environment variables if present
env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)

from fastapi import FastAPI, Request, status, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.api.products import router as products_router
from app.api.orders import router as orders_router
from app.api.auth import router as auth_router
from app.api.payments import router as payments_router
from app.api.admin import router as admin_router
from app.api.location import router as location_router
from app.api.admin_locations import router as admin_locations_router
from app.api.addresses import router as addresses_router
from app.api.wishlist import router as wishlist_router
from app.api.reviews import router as reviews_router
from app.db.database import engine, Base, SessionLocal


# Import models so Base metadata is aware of all tables before create_all
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.models.user import User
from app.models.payment import Payment
from app.models.delivery_location import DeliveryLocation
from app.services.auth_service import init_default_admin
from app.services.location_service import seed_default_locations
from app.services.product_service import seed_default_products

# Ensure tables exist safely (Alembic / app.db.migrate handles explicit column migrations)
Base.metadata.create_all(bind=engine)

# Initialize default admin, default delivery locations, and initial product catalog on startup if missing
db = SessionLocal()
try:
    init_default_admin(db)
    seed_default_locations(db)
    seed_default_products(db)
finally:
    db.close()



app = FastAPI(
    title="PYHARA Eco-Marketplace API",
    description="Backend API for PYHARA eco-friendly artisan crafts marketplace.",
    version="0.7.0",
)

from fastapi import Request, status
from fastapi.responses import JSONResponse

# Enable CORS middleware (supports ALLOWED_ORIGINS env variable in production)
allowed_origins_raw = os.getenv("ALLOWED_ORIGINS", "*").strip()
if allowed_origins_raw and allowed_origins_raw != "*":
    origins = [o.strip() for o in allowed_origins_raw.split(",") if o.strip()]
else:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
            headers=getattr(exc, "headers", None),
        )
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
app.include_router(addresses_router)
app.include_router(wishlist_router)
app.include_router(reviews_router)



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
