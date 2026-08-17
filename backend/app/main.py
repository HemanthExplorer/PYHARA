from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.products import router as products_router
from app.api.orders import router as orders_router
from app.db.database import engine, Base

# Import models so Base metadata is aware of all tables before create_all
from app.models.product import Product
from app.models.order import Order, OrderItem

# Create missing database tables safely
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PYHARA Eco-Marketplace API",
    description="Backend API for PYHARA eco-friendly artisan crafts marketplace.",
    version="0.2.0",
)

# Enable CORS for Vite local dev server (port 5173 / default localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products_router)
app.include_router(orders_router)


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
