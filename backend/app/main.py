from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import Base, engine
from app.api.products import router as products_router

# Create database tables automatically on startup if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Eco Marketplace API",
    description="Backend API for Eco Marketplace sustainable e-commerce platform",
    version="0.2.0"
)

# CORS Middleware configuration (allow ports 3000 and 3001 for dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Products API router
app.include_router(products_router)


@app.get("/")
def read_root():
    return {
        "message": "Eco Marketplace API is running",
        "version": "0.2.0",
        "docs_url": "/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}
