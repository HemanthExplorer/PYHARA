import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Dynamically resolve database connection configuration:
# 1. Respect production DATABASE_URL if set (e.g., PostgreSQL or persistent volume SQLite)
# 2. Convert legacy Render/Heroku postgres:// URI prefix to postgresql://
# 3. Fallback to local SQLite file backend/pyhara.db for development
raw_db_url = os.getenv("DATABASE_URL")
env_mode = os.getenv("ENVIRONMENT", os.getenv("ENV", "")).lower()
is_cloud_prod = bool(os.getenv("RENDER") or env_mode == "production" or env_mode == "prod")

if raw_db_url:
    if raw_db_url.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URL = raw_db_url.replace("postgres://", "postgresql://", 1)
    else:
        SQLALCHEMY_DATABASE_URL = raw_db_url
elif is_cloud_prod:
    raise RuntimeError(
        "CRITICAL DATABASE CONFIGURATION ERROR: DATABASE_URL environment variable is missing in production environment. "
        "The application will not fall back to an ephemeral local SQLite database. Please configure a persistent PostgreSQL database."
    )
else:
    custom_sqlite_path = os.getenv("SQLITE_DB_PATH")
    if custom_sqlite_path:
        DB_PATH = Path(custom_sqlite_path)
    else:
        BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
        DB_PATH = BACKEND_DIR / "pyhara.db"

    SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH.as_posix()}"

# Pass SQLite-specific connect args only when using SQLite engine
connect_args = {}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

