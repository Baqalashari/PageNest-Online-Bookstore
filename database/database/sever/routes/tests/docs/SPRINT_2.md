# PageNest - Sprint 2 Documentation

**Student Name:** BAKHTAWAR  
**Roll Number:** 2k23/CSM/30  
**Course:** E-Commerce  
**Institute:** Institute of Mathematics & Computer Science, University of Sindh, Jamshoro  

---

## 1. Sprint Goal and Scope Boundary

### Sprint Goal
Given a product catalog administrator, the system must persist categories, products, variants, and SKUs without losing identity, relationship, price, or inventory meaning[cite: 1]. This sprint establishes a reliable database foundation, migrations, basic administration APIs, representative seed data, and automated verification[cite: 1].

### In Scope
- Category tree management with parent-child relationships and unique slugs.
- Product creation and editing (status, descriptive content, category assignment).
- Variants and SKU records with unique codes, decimal price, stock quantity, and active availability[cite: 2].
- Authenticated JWT administrative endpoints for CRUD operations[cite: 2].
- Database integrity constraints (PostgreSQL), seed data scripts, and automated test suite[cite: 2].

### Out of Scope
- Dynamic specifications, asset uploads, public catalog search, publication workflows, payment gateway integration, order placement, shipping integration, and complete shopper checkout flows (deferred to Sprint 3+)[cite: 2].

---

## 2. Link to Sprint 1 Decisions

Sprint 2 builds directly upon the Sprint 1 architecture without discarding previous design decisions.
- **Reused Architecture:** Reuses Node.js/Express backend, PostgreSQL database, and JWT authentication structure established in Sprint 1[cite: 1].
- **Reused Entities:** Retains original MVP entities (`USERS`, `ORDERS`, `ORDER_ITEMS`, `CART`, `CART_ITEMS`).
- **Catalog Extension:** Extends the initial basic `BOOKS` and `CATEGORIES` tables into a normalized schema with `CATEGORIES`, `PRODUCTS`, `VARIANTS`, `SKUS`, and `ASSETS`.

---

## 3. Updated ERD and Data Dictionary

### Mermaid ERD
```mermaid
erDiagram
    CATEGORIES ||--o{ CATEGORIES : parent
    CATEGORIES ||--o{ PRODUCTS : contains
    PRODUCTS ||--o{ VARIANTS : has
    VARIANTS ||--o{ SKUS : materializes
    PRODUCTS ||--o{ ASSETS : displays
    SKUS ||--o{ CART_ITEMS : selected_as
    SKUS ||--o{ ORDER_ITEMS : sold_as
    USERS ||--o{ ORDERS : places
    USERS ||--|| CART : owns
    ORDERS ||--|{ ORDER_ITEMS : contains
    CART ||--o{ CART_ITEMS : contains

    CATEGORIES {
        int id PK
        int parent_id FK "ON DELETE SET NULL"
        string name
        string slug UK
        boolean is_active
        timestamp created_at
    }

    PRODUCTS {
        int id PK
        int category_id FK "ON DELETE RESTRICT"
        string name
        string slug UK
        string description
        string status
        jsonb specifications
        timestamp created_at
    }

    VARIANTS {
        int id PK
        int product_id FK "ON DELETE CASCADE"
        string option_name
        string option_value
    }

    SKUS {
        int id PK
        int variant_id FK "ON DELETE CASCADE"
        string sku_code UK
        decimal price "CHECK price >= 0"
        int stock_quantity "CHECK stock_quantity >= 0"
        boolean is_active
    }

    ASSETS {
        int id PK
        int product_id FK "ON DELETE CASCADE"
        string url
        string role
        int sort_order
    }
