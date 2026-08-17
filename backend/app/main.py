from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Eco Marketplace API",
    description="Backend API for Eco Marketplace sustainable e-commerce platform",
    version="0.1.0"
)

# CORS Middleware configuration (allow localhost for dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {
        "message": "Eco Marketplace API is running",
        "version": "0.1.0",
        "docs_url": "/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}
