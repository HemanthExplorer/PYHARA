"""
PYHARA Eco-Marketplace — Explicit Safe Database Migration Runner

Inspecting engine and database tables safely without data loss.
Can be executed explicitly via:
  python -m app.db.migrate
"""

import sys
from pathlib import Path
from sqlalchemy import inspect, text, Column, String, Boolean, DateTime, Integer, Text, ForeignKey
from app.db.database import engine, Base

# Import all models to register Base metadata
from app.models import User, Product, Order, OrderItem, Payment, DeliveryLocation, Address, Wishlist, Review


def run_migrations():
    print("=== EXPLICIT DATABASE SCHEMA MIGRATION ===")
    
    # 1. Create missing tables using Base metadata safely (SQLAlchemy skips existing tables)
    print("Ensuring all database tables exist...")
    Base.metadata.create_all(bind=engine)
    print("[PASS] Base metadata create_all completed.")

    inspector = inspect(engine)
    
    with engine.connect() as conn:
        # 2. Check and migrate `users` table columns
        if inspector.has_table("users"):
            columns = [c["name"] for c in inspector.get_columns("users")]
            if "full_name" not in columns:
                print("Adding column 'full_name' to 'users' table...")
                conn.execute(text("ALTER TABLE users ADD COLUMN full_name VARCHAR"))
                conn.commit()
            if "phone" not in columns:
                print("Adding column 'phone' to 'users' table...")
                conn.execute(text("ALTER TABLE users ADD COLUMN phone VARCHAR"))
                conn.commit()

        # 3. Check and migrate `orders` table columns
        if inspector.has_table("orders"):
            columns = [c["name"] for c in inspector.get_columns("orders")]
            if "user_id" not in columns:
                print("Adding column 'user_id' to 'orders' table...")
                conn.execute(text("ALTER TABLE orders ADD COLUMN user_id VARCHAR"))
                conn.commit()
            if "payment_status" not in columns:
                print("Adding column 'payment_status' to 'orders' table...")
                conn.execute(text("ALTER TABLE orders ADD COLUMN payment_status VARCHAR DEFAULT 'Pending'"))
                conn.commit()
            if "payment_method" not in columns:
                print("Adding column 'payment_method' to 'orders' table...")
                conn.execute(text("ALTER TABLE orders ADD COLUMN payment_method VARCHAR DEFAULT 'RAZORPAY'"))
                conn.commit()
            if "pincode" not in columns:
                print("Adding column 'pincode' to 'orders' table...")
                conn.execute(text("ALTER TABLE orders ADD COLUMN pincode VARCHAR"))
                conn.commit()
            if "city" not in columns:
                print("Adding column 'city' to 'orders' table...")
                conn.execute(text("ALTER TABLE orders ADD COLUMN city VARCHAR"))
                conn.commit()
            if "state" not in columns:
                print("Adding column 'state' to 'orders' table...")
                conn.execute(text("ALTER TABLE orders ADD COLUMN state VARCHAR"))
                conn.commit()
            if "delivery_charge" not in columns:
                print("Adding column 'delivery_charge' to 'orders' table...")
                conn.execute(text("ALTER TABLE orders ADD COLUMN delivery_charge NUMERIC(10,2) DEFAULT 0.00"))
                conn.commit()
            if "estimated_delivery_days" not in columns:
                print("Adding column 'estimated_delivery_days' to 'orders' table...")
                conn.execute(text("ALTER TABLE orders ADD COLUMN estimated_delivery_days INTEGER DEFAULT 3"))
                conn.commit()

    print("=== MIGRATIONS COMPLETED SAFELY ===")

if __name__ == "__main__":
    run_migrations()
