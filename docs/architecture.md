# Eco Marketplace — System Architecture

This document defines the high-level system architecture for **Eco Marketplace**, a reusable, modular e-commerce platform built for sustainable and eco-friendly products.

---

## 1. High-Level Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    User Browser                         │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│              React / Vite Frontend                      │
│   - React 18 Single Page Application (SPA)             │
│   - Global CSS Design Tokens & Eco Theme                │
└────────────────────────────┬────────────────────────────┘
                             │
                             │ REST API (HTTP/JSON)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                FastAPI Backend                          │
│   - Python FastAPI Application                          │
│   - Endpoints: GET /, GET /health                       │
│   - Modular package structure (api, models, services)   │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│             PostgreSQL Database (FUTURE)                │
│   - Status: Future Integration (Milestone v0.2)         │
│   - Relational store for products, users, orders        │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Component Details

### Frontend Layer (`frontend/`)
- **Framework**: React 18 with Vite build tool.
- **Language**: JavaScript (ES Modules).
- **Styling**: Custom CSS design system with CSS custom properties (`--bg-primary`, `--accent-emerald`, etc.), dark theme aesthetic, glassmorphic UI components, and fluid typography.
- **Role**: Client interface rendering UI views and consuming REST APIs.

### Backend Layer (`backend/`)
- **Framework**: FastAPI (Python 3.10+).
- **Server**: Uvicorn ASGI server.
- **Modular Package Structure**:
  - `app/main.py`: Application entry point and router initialization.
  - `app/api/`: REST API endpoints and routing logic.
  - `app/core/`: Application settings, security, and global configuration.
  - `app/models/`: Database ORM models (Future).
  - `app/schemas/`: Data validation and serialization models (Pydantic).
  - `app/services/`: Business logic and external service integrations.
  - `app/db/`: Database connection management and session handling (Future).
- **Role**: Core application backend exposing REST APIs, enforcing business logic, and handling future data persistence.

### Database Layer (Future Integration)
- **Engine**: PostgreSQL (Planned for v0.2).
- **Role**: Persistent data storage for products, categories, user profiles, shopping carts, orders, and payment records.
- **Current Status**: Marked as **Future Integration**. No active database connections or models in v0.1.

---

## 3. Communication & Data Flow

1. Client makes HTTP REST API requests to the FastAPI backend.
2. FastAPI validates incoming payloads using Pydantic schemas.
3. Backend processes logic through service modules.
4. *(Future)* Backend queries PostgreSQL database and returns structured JSON responses to the frontend.

---

## 4. Key Design Principles

- **Category Agnostic**: Built to support any sustainable handcrafted product category (Ganesh idols, diyas, terracotta, eco-gifts, home decor).
- **Loose Coupling**: Frontend and backend are completely decoupled and independently runnable.
- **Scalability**: Clean modular directory structure ready for incremental feature additions without refactoring base architecture.
