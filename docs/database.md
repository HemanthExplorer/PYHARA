# Eco Marketplace — Database Architectural Planning

This document contains architectural planning and design notes for the future database integration of **Eco Marketplace**.

> [!NOTE]
> **Current Integration Status**: Architectural Planning Only. Database implementation and ORM code are planned for **Milestone v0.2**.

---

## 1. Database Target System
- **Database Engine**: PostgreSQL (Planned)
- **ORM / Query Layer**: SQLAlchemy 2.0 (Planned)
- **Database Migration Tool**: Alembic (Planned)

---

## 2. Planned Entity Domain Schema

```
                      ┌──────────────────┐
                      │    Categories    │
                      └────────┬─────────┘
                               │ 1:N
                               ▼
┌──────────────────┐  1:N   ┌──────────────────┐
│     Sellers      ├───────►│     Products     │
└──────────────────┘        └────────┬─────────┘
                                     │ 1:N
                                     ▼
┌──────────────────┐  1:N   ┌──────────────────┐
│      Users       ├───────►│    OrderItems    │◄───┐ N:1
└────────┬─────────┘        └──────────────────┘    │
         │ 1:N                                      │
         ▼                                          │
┌──────────────────┐                                │
│      Orders      ├────────────────────────────────┘
└──────────────────┘ 1:N
```

### Key Planned Entities:
1. **Users**: Customer and seller account information, credentials, and roles.
2. **Sellers / Artisans**: Profiles for local artisans crafting eco-friendly goods.
3. **Categories**: Hierarchical categories (e.g., Natural Clay Idols, Terracotta, Diyas, Eco Home Decor, Handcrafted Gifts).
4. **Products**: Title, description, price, stock, eco-friendly material tags, image URLs, artisan ID, category ID.
5. **Orders**: Order status, total price, shipping address, user ID.
6. **OrderItems**: Line items mapping products to orders with historical pricing.

---

## 3. Data Integrity & Sustainability Metadata

Future table definitions will enforce:
- Foreign key constraints with appropriate deletion cascades.
- Material certification flags (e.g., `is_100pct_biodegradable`, `natural_dyes_only`).
- Product weight and dimensions for eco-shipping calculations.
