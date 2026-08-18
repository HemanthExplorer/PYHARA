# PYHARA — Eco-Marketplace

PYHARA is a full-stack, production-ready eco-commerce marketplace built to bring traditional Indian heritage crafts, eco-friendly earthenware, and conscious living products to modern consumers. The application combines a responsive React + Vite frontend with a high-performance FastAPI Python backend, SQLite/SQLAlchemy database architecture, and server-verified Razorpay payment processing.

GitHub Repository: [https://github.com/HemanthExplorer/PYHARA.git](https://github.com/HemanthExplorer/PYHARA.git)

---

## Features

### Customer Features
- **Product Catalog & Browsing**: Interactive product catalog with real-time stock availability status (`In Stock`, `Out of Stock`, `Coming Soon`).
- **Product Search & Filtering**: Real-time modal search and category filtering for traditional crafts.
- **Cart Management**: Dynamic slide-out cart drawer and dedicated cart page supporting item additions, quantity adjustments, item removals, and subtotal calculations.
- **Form & Input Validation**: Comprehensive client-side and server-side validation for customer name, email, 10-digit Indian phone number (`+91`), and detailed shipping address.
- **Customer Location Selection**:
  - 📍 **Use My Location**: Browser `navigator.geolocation` with low-latency positioning and automatic IP-based location fallback (`BigDataCloud` / `ipapi`) to resolve 6-digit Indian PIN codes.
  - 🔢 **Enter PIN Code**: Direct 6-digit Indian PIN input (`^[1-9][0-9]{5}$`) with instant database serviceability checks.
  - 🔍 **Search & Select Location**: Public modal listing active delivery locations with search by PIN code, City, and State.
- **Delivery Pricing & Estimates**: Automatic calculation of delivery charges and estimated delivery days based on admin-configured serviceability rules.
- **Razorpay Payments**: Integrated Razorpay Test Mode checkout with HMAC SHA256 signature verification server-side.
- **Order Confirmation & Tracking**: Immutable order summary display and real-time tracking by UUID or human-readable order number (`PYH-2026-XXXX`).

### Admin Features
- **Admin Authentication**: Secure JWT-based admin login with bcrypt password hashing and 60-minute token expiration.
- **Dashboard Analytics**: Real database metrics aggregation for Total Orders, Pending Orders, Paid Orders, Total Revenue, Low Stock Count, and Out of Stock Count.
- **Product & Stock Management**: Complete Product CRUD interface with price updates, stock quantity adjustments, category selection, and automatic availability calculation.
- **Order Management & State Machine**: Admin order view, payment verification review, and strict fulfillment status transitions (`Pending` → `Confirmed` → `Shipped` → `Delivered`).
- **Delivery Location Serviceability Control**: Database-backed delivery area management: list, search, filter (`All`, `Active`, `Inactive`), add location, edit delivery charge, adjust estimated delivery days, toggle active status, and delete locations with duplicate PIN prevention.

---

## Tech Stack

### Frontend
- **Framework**: React 18.3 (`react`, `react-dom`)
- **Build Tool**: Vite 5.4 (`@vitejs/plugin-react`)
- **Routing**: React Router DOM 7.1
- **Styling**: Vanilla CSS3 design system with custom CSS variables, responsive grids, dark modes, and micro-animations

### Backend
- **Framework**: FastAPI 0.110 (Python 3.14 / 3.12 compatibility)
- **ASGI Server**: Uvicorn 0.28
- **Database & ORM**: SQLAlchemy 2.0 with SQLite database engine
- **Schema Validation**: Pydantic v2
- **Authentication**: PyJWT (HMAC SHA256 JWT tokens) & Passlib (bcrypt password hashing)
- **Payment Processing**: Razorpay Python SDK (v2.0.1)

---

## Architecture

### Backend Directory Structure (`backend/app/`)
```
backend/app/
├── api/                  # FastAPI REST API Routers
│   ├── admin.py          # Dashboard metrics router
│   ├── admin_locations.py # JWT-protected delivery location CRUD router
│   ├── auth.py           # Admin authentication login router
│   ├── location.py       # Public customer location & serviceability router
│   ├── orders.py         # Order creation and tracking router
│   ├── payments.py       # Razorpay order creation & signature verification router
│   └── products.py       # Public product catalog router
├── core/                 # Core utilities
│   ├── config.py         # App settings & environment variables
│   ├── deps.py           # Dependency injection (JWT admin guards & DB sessions)
│   └── security.py       # Password hashing & JWT token handling
├── db/                   # Database configuration
│   └── database.py       # SQLAlchemy engine & SessionLocal factory
├── models/               # SQLAlchemy ORM Models
│   ├── delivery_location.py # DeliveryLocation DB model
│   ├── order.py          # Order & OrderItem DB models
│   ├── payment.py        # Payment DB model
│   ├── product.py        # Product DB model
│   └── user.py           # Admin User DB model
├── schemas/              # Pydantic Schemas
│   ├── delivery_location.py # Serviceability & location schemas
│   ├── order.py          # Order creation & response schemas
│   ├── payment.py        # Payment request & verification schemas
│   ├── product.py        # Product CRUD schemas
│   └── user.py           # Admin authentication schemas
├── services/             # Business Logic & Service Layers
│   ├── admin_service.py  # Dashboard statistics service
│   ├── auth_service.py   # Admin seed & authentication service
│   ├── location_service.py # Postal lookup & DB serviceability service
│   ├── order_service.py  # Order creation, status machine, & snapshotting service
│   ├── payment_service.py # Razorpay integration & signature verification service
│   └── product_service.py # Product catalog CRUD & stock service
└── main.py               # FastAPI application entry point, CORS, & schema migrations
```

### Frontend Directory Structure (`frontend/src/`)
```
frontend/src/
├── components/           # Reusable UI Components
│   ├── Header.jsx        # Navigation header & mobile menu drawer
│   ├── Footer.jsx        # Customer footer with section navigation
│   ├── CartDrawer.jsx    # Slide-out shopping cart drawer
│   ├── LocationSelectorModal.jsx # Searchable delivery location modal
│   ├── ProtectedAdminRoute.jsx   # JWT route guard for admin views
│   └── ...
├── context/              # React Context Providers
│   ├── AuthContext.jsx   # Admin JWT authentication context
│   └── CartContext.jsx   # Shopping cart state & toast notifications context
├── pages/                # Page Views
│   ├── Home.jsx          # Marketplace homepage with smooth hash scrolling
│   ├── Shop.jsx          # Product catalog page with search & filters
│   ├── ProductDetail.jsx # Product detail view
│   ├── Cart.jsx          # Dedicated shopping cart page
│   ├── Checkout.jsx      # Order checkout with 3 location selection methods
│   ├── OrderConfirmation.jsx # Post-payment confirmation page
│   ├── OrderTracking.jsx     # Order status tracking view
│   ├── AdminLogin.jsx    # Secure admin login view
│   ├── AdminDashboard.jsx# Admin metrics dashboard view
│   ├── AdminProducts.jsx # Admin product & stock CRUD view
│   ├── AdminOrders.jsx   # Admin order fulfillment view
│   └── AdminLocations.jsx# Admin delivery location control view
├── services/             # Frontend API Service Clients
│   ├── locationService.js# Customer postal & location API client
│   ├── orderService.js   # Order placement & tracking API client
│   ├── paymentService.js# Razorpay payment API client
│   └── ...
├── App.jsx               # Main React Router configuration
├── index.css             # Main design system & responsive stylesheet
└── main.jsx              # React application root DOM renderer
```

---

## Security

- **JWT-Protected Admin Routes**: All admin mutations (`/api/admin/*`) require valid JWT bearer tokens inspected via `get_current_admin`. Non-admin or invalid requests return HTTP 401 Unauthorized or HTTP 403 Forbidden.
- **Password Hashing**: Admin passwords are stored as secure bcrypt hashes using `passlib`.
- **Server-Side Razorpay Secrecy**: `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, and `JWT_SECRET_KEY` are maintained strictly server-side in backend environment variables and never exposed to client bundles.
- **Backend Serviceability Enforcer**: Order creation (`create_order`) re-verifies PIN serviceability against the database. Frontend-submitted delivery charges or product prices are ignored and calculated server-side.
- **Inventory Concurrency Protection**: Atomic database transactions check `stock_quantity >= requested_qty` before reserving inventory, preventing overselling under concurrent requests.
- **CORS Configuration**: FastAPI middleware configured for safe cross-origin requests during local development.

---

## Location & Delivery System

1. **Format Validation**: Indian postal codes are validated using regex `^[1-9][0-9]{5}$`.
2. **Database-Backed Serviceability**: Serviceability is determined strictly by the `delivery_locations` table managed by admins.
3. **Delivery Charges & Delivery Time**: Admin-configured `delivery_charge` and `estimated_delivery_days` are snapshot into the order at creation time.
4. **Order Location Snapshot**: Each order records an immutable snapshot of `pincode`, `city`, `state`, `delivery_charge`, and `estimated_delivery_days`. Subsequent admin changes to location rates do not affect historical orders.
5. **Customer Experience**: Customers can use GPS location detection, enter a 6-digit PIN code, or search the active locations modal to select their delivery area.

---

## Payment System

PYHARA integrates **Razorpay Test Mode** for payment processing:
1. When a customer places an order, the FastAPI backend creates a Razorpay Order via the Razorpay API (`razorpay_client.order.create`).
2. The frontend opens the Razorpay Test Checkout modal (`window.Razorpay`).
3. Upon payment completion, the backend verifies the HMAC SHA256 signature (`razorpay_order_id + "|" + razorpay_payment_id` signed with `RAZORPAY_KEY_SECRET`).
4. Once verified, a `Payment` record is logged in the database, the order `payment_status` becomes `Paid`, and fulfillment status advances to `Confirmed`.

*Note: The repository is configured and tested using Razorpay Test Mode credentials.*

---

## Order & Inventory System

- **Inventory Deductions**: Stock is deducted at order placement. If an order is cancelled or payment fails, stock is restored exactly once using idempotent transaction locks.
- **Status Separation**:
  - **Payment Status**: `Pending`, `Paid`, `Failed`, `Cancelled`, `Refunded`
  - **Fulfillment Status**: `Pending`, `Confirmed`, `Shipped`, `Delivered`, `Cancelled`
- **Fulfillment Progression**: Strictly enforces valid state transitions (`Pending` → `Confirmed` → `Shipped` → `Delivered`). Invalid transitions are rejected with HTTP 400.

---

## Testing & Verification

The project includes an extensive automated integration test suite located in the test scratch directory:

| Test Script | Scope & Scenarios Verified | Status |
| :--- | :--- | :--- |
| `test_phase1_location.py` | PIN regex, postal API, non-existent PIN rejection, snapshotting | **PASSED (5/5)** |
| `test_phase1_inventory.py` | Stock quantity deduction, negative stock prevention | **PASSED** |
| `test_phase2_concurrency.py` | Simultaneous stock=1 purchases (1 success, 1 409 Conflict), stock restoration | **PASSED (3/3)** |
| `test_phase2_orders.py` | Order creation, UUID/number lookup | **PASSED** |
| `test_phase3_dashboard.py` | Admin dashboard metrics database aggregation | **PASSED** |
| `test_phase4_products.py` | Product CRUD & availability status calculation | **PASSED** |
| `test_phase5_status.py` | Fulfillment status state machine transition validation | **PASSED** |
| `test_phase7_security.py` | JWT guards, unauthorized token rejection | **PASSED** |
| `test_phase13_serviceability.py` | Admin location CRUD, duplicate PIN rejection, disabled PIN rejection | **PASSED (8/8)** |
| `test_final_release_suite.py` | Master E2E release integration (Active locations API, GPS resolution, location modal, price tamper prevention, Razorpay signature, metrics, security guards) | **PASSED (10/10)** |

### Compilation & Build Verification
- **Backend Python Compilation**: `python -m compileall app` → **0 compilation errors**
- **Frontend Production Build**: `npm run build` → **Succeeded in 1.08s** with 0 errors/warnings

---

## Project Structure

```
eco-marketplace/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── data/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── README.md
└── LICENSE
```

---

## Local Development

### Prerequisites
- Python 3.10+ (Tested on Python 3.12 / 3.14)
- Node.js 18+ and npm

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.\.venv\Scripts\activate
# Linux/macOS:
# source .venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
```

Edit `backend/.env` with your development settings:
```env
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@pyhara.com
ADMIN_PASSWORD=YourSecurePassword123!
JWT_SECRET_KEY=your_development_jwt_secret_key_32bytes
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=rzp_test_your_key_secret
```

Start the FastAPI server:
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
The FastAPI backend server runs at `http://127.0.0.1:8000`. Interactive API documentation is available at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install

# Start Vite development server
npm run dev
```
The Vite development server runs at `http://localhost:5173`.

---

## Environment Variables

The backend relies on the following environment variables (defined in `backend/.env.example`):

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `ADMIN_USERNAME` | Seed default admin username | `admin` |
| `ADMIN_EMAIL` | Seed default admin email address | `admin@pyhara.com` |
| `ADMIN_PASSWORD` | Seed default admin password | `AdminPass123!` |
| `JWT_SECRET_KEY` | Secret key for signing JWT tokens | `32_byte_secret_string` |
| `JWT_ALGORITHM` | JWT signing algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Admin JWT token lifespan | `60` |
| `RAZORPAY_KEY_ID` | Razorpay API Key ID (Test/Live) | `rzp_test_xxxx` |
| `RAZORPAY_KEY_SECRET` | Razorpay API Key Secret (Test/Live) | `rzp_test_secret_xxxx` |

---

## Production Notes

- **Payment Mode**: Replace Razorpay Test Mode keys with live credentials in environment variables when deploying for real payment processing.
- **Secrets Management**: Keep `JWT_SECRET_KEY` and `RAZORPAY_KEY_SECRET` strictly on the backend server.
- **Database Engine**: The application currently uses SQLite (`sqlite:///./eco_marketplace.db`), which is lightweight and ideal for demonstration and local testing. For high-concurrency production deployments, configure SQLAlchemy for PostgreSQL or MySQL.

---

## Demo Flow

### Customer Shopping Flow
1. **Homepage** (`/`) → View curated Indian craft banner and guiding philosophy.
2. **Shop Catalog** (`/shop`) → Search and filter eco-friendly products.
3. **Product Detail** (`/product/:id`) → View detailed specifications and stock availability.
4. **Cart Drawer / Cart Page** (`/cart`) → Review items and click "Proceed to Checkout".
5. **Checkout** (`/checkout`) → Select location via **Use My Location 📍**, **Enter PIN 🔢**, or **Search Location 🔍**.
6. **Payment & Confirmation** → Pay via Razorpay Test Mode and view order confirmation (`/order/:id`).
7. **Order Tracking** → Track real-time fulfillment status by order number.

### Admin Flow
1. **Admin Login** (`/admin/login`) → Log in with admin credentials.
2. **Dashboard** (`/admin/dashboard`) → Review real DB analytics (Orders, Revenue, Low Stock).
3. **Product CRUD** (`/admin/products`) → Manage products, stock quantities, and prices.
4. **Order Management** (`/admin/orders`) → View customer payments and advance fulfillment status (`Confirmed` → `Shipped` → `Delivered`).
5. **Delivery Locations** (`/admin/locations`) → Add PIN codes, adjust delivery charges, set estimated days, or disable non-serviceable areas.

---

## License

This repository includes an unconfigured `LICENSE` file. All rights are reserved by the project owners.

---

## GitHub Repository

[https://github.com/HemanthExplorer/PYHARA.git](https://github.com/HemanthExplorer/PYHARA.git)
