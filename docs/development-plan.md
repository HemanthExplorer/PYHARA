# Eco Marketplace — Development Roadmap & Plan

This document outlines the phased development roadmap for the **Eco Marketplace** platform.

---

## Current Milestone

### ✅ v0.1 — Application Foundation (ACTIVE)
- **Objective**: Establish decoupled project foundation for React frontend and FastAPI backend.
- **Frontend**:
  - React 18 application initialized with Vite.
  - Basic application entry point and global eco design system CSS.
  - Placeholder page rendering `"Application foundation is ready."`
- **Backend**:
  - Python FastAPI app structure with modular directories (`api`, `core`, `models`, `schemas`, `services`, `db`).
  - Implemented `/` and `/health` JSON status endpoints.
  - Minimal `requirements.txt` and virtual environment setup.
- **Status**: Completed foundation setup.

---

## Planned Future Milestones

### 📋 v0.2 — Database & Data Models Architecture
- Setup PostgreSQL database connection and SQLAlchemy ORM / Alembic migrations.
- Define core domain schemas: Products, Categories, Inventory, Sellers, Users.
- Seed database with general sustainable product categories.

### 📋 v0.3 — Authentication & User Management
- User registration, login, and JWT token authentication.
- Role-based access control (Customers, Vendors/Artisans, Admin).
- User profile management.

### 📋 v0.4 — Product Catalog & Search
- Product listing APIs with filtering by category, eco-certification, price, and tags.
- Detailed product view page with image galleries and artisan story metadata.
- Product search functionality.

### 📋 v0.5 — Shopping Cart & Order Processing
- Guest and authenticated user shopping cart state management.
- Cart items persistent sync API.
- Order creation, price calculation, and tax/shipping logic.

### 📋 v0.6 — Payment Gateway & Notifications
- Secure payment gateway integration (Stripe / Razorpay).
- Transaction status callbacks and webhook handling.
- Email/SMS order notifications.

### 📋 v0.7 — Artisan Dashboard & Platform Admin
- Vendor management portal for managing handcrafted product inventories.
- Platform admin dashboard for reviewing eco-certifications, orders, and sales metrics.
