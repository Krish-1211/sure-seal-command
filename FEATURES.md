# Sure Seal SFA — Field Sales Automation Platform
## Complete Feature Documentation

> **Version:** 1.0.0  
> **Stack:** React + TypeScript (Vite), Node.js / Express backend, PostgreSQL via Supabase  
> **Planned integration:** Neto by Maropost

---

## Table of Contents

1. [Authentication System](#1-authentication-system)
2. [Role-Based Access Control (RBAC)](#2-role-based-access-control-rbac)
3. [Admin Dashboard](#3-admin-dashboard)
4. [Salesman Dashboard](#4-salesman-dashboard)
5. [Product Catalog](#5-product-catalog)
6. [B2B Pricing Level System](#6-b2b-pricing-level-system)
7. [Shopping Cart](#7-shopping-cart)
8. [Customer Management](#8-customer-management)
9. [Customer Details Page](#9-customer-details-page)
10. [Order Submission Flow](#10-order-submission-flow)
11. [Order History Portal](#11-order-history-portal)
12. [Sales Portal (Team Management)](#12-sales-portal-team-management)
13. [Analytics Page](#13-analytics-page)
14. [User Profile](#14-user-profile)
15. [App Settings](#15-app-settings)
16. [Navigation & Layout](#16-navigation--layout)
17. [Backend API](#17-backend-api)
18. [Database Architecture (Supabase)](#18-database-architecture-supabase)

---

## 1. Authentication System

### Overview
The login system is fully database-driven. Credentials are validated against the `users` table in Supabase, ensuring that any account changes (new users, password updates) are reflected immediately without redeploying code.

### How It Works
- The salesman or admin opens the app and is presented with the **Sign In** screen showing the Sure Seal Sealants logo.
- They enter their **username** and **password**.
- The frontend sends a `POST /api/login` request to the Express backend.
- The backend queries the `users` table: `SELECT ... WHERE username = $1 AND password = $2`.
- On success, the full user object (`id`, `name`, `role`, `region`, `phone`, `email`) is returned and stored in `localStorage` so the session persists across page refreshes.
- On failure (wrong credentials), a clear error toast is shown.

### Current Demo Accounts

| Username  | Password     | Role      | Region         |
|-----------|--------------|-----------|----------------|
| kevin     | kevin123     | Admin     | Head Office    |
| scott     | scott123     | Salesman  | Melbourne SE   |
| sarah     | sarah123     | Salesman  | Sydney North   |
| michael   | michael123   | Salesman  | Brisbane       |

### Security Notes
- User session lives in `localStorage` as a JSON object.
- All protected routes use a `ProtectedRoute` wrapper that redirects to `/login` if no session is found.
- Passwords are currently stored in plaintext for the demo. Production would use bcrypt hashing.

---

## 2. Role-Based Access Control (RBAC)

### Overview
The app has two distinct roles — **Admin** and **Salesman** — each with different capabilities and views.

### Admin Capabilities
- See all orders across all salespeople
- See every salesman's name on each order
- Access the **Sales Portal** to monitor each sales rep's KPIs and performance
- Access **Pricing Management** to create, edit, and delete pricing levels and set per-SKU prices
- View total company revenue and total order count on the dashboard
- View full Recent Activity across all reps

### Salesman Capabilities
- See only their own orders in the Order History
- Browse the product catalog and apply any available pricing level to view prices
- Create orders on behalf of customers
- Add new customers directly from the cart
- View their own performance metrics on the dashboard and Analytics page
- Cannot access or modify pricing level definitions

### Implementation
- The `useAuth()` hook provides the current `user` object with a `role` field everywhere in the app.
- Conditional rendering (`user?.role === 'admin'`) is used throughout to show or hide UI elements based on role.
- The Admin Dashboard and Salesman Dashboard are completely separate React components rendered conditionally inside the `Dashboard` page.

---

## 3. Admin Dashboard

### Overview
The Admin Dashboard gives Kevin (and any future admin) a real-time bird's-eye view of the entire business, powered by live database queries.

### Features

#### Total Sales Card
- Pulls all orders from `/api/orders` and sums up the `grandTotal` for every order.
- Displays in Australian dollar format (e.g. `$22,323.89`).
- Updates automatically each time the page is loaded or navigated to.

#### Total Orders Card
- Displays the raw count of all orders in the database.

#### Recent Activity & Orders Feed
- Lists all orders from the database in reverse-chronological order (newest first).
- Each order card shows:
  - **Order number** (last 6 digits of the database ID, e.g. `Order #904412`)
  - **Date & time** the order was placed
  - **"Sold By [Salesman Name]"** — the name of the rep who placed the order, retrieved via a SQL JOIN with the `users` table
  - **Grand total** (formatted as currency)
  - **Number of items** in that order

---

## 4. Salesman Dashboard

### Overview
The Salesman Dashboard gives each sales rep a personalised view of their day and quick access to key actions.

### Features

#### Header
- Displays "Good Morning" greeting with the salesman's full name (pulled from the authenticated user session).
- Shows a live Sync Indicator and a Notification bell button.

#### Global Search Bar
- A prominent full-width search bar for finding stores, products, and orders quickly.

#### Performance Ring
- A circular visual KPI ring showing percentage toward monthly target.
- Displays: Revenue generated (MTD), Number of orders fulfilled, Number of pending orders.

#### Next Stop Card
- Shows the next recommended customer visit with store name, address, visit priority level, and estimated ETA.

#### Sales Trend Chart
- A visual chart showing order/revenue trend over time (Recharts).

#### Quick Actions
Three one-tap shortcut buttons:
- **New Order** — navigates to the Product Catalog
- **Check In** — triggers a store check-in notification
- **Scan Code** — activates the barcode scanner flow

#### Recent Activity Feed
- Shows latest check-ins and submitted orders with timestamps.

---

## 5. Product Catalog

### Overview
The Catalog is the central product browsing hub where salespeople search for and add products to the cart. All product data is stored in Supabase and fetched live via the API.

### Features

#### Live Product Fetching
- All products, their descriptions, categories, and variants (sizes, SKUs, prices) are fetched from `GET /api/products`.
- The API reconstructs a nested product object where each product has an array of `variants`.

#### Category Filtering
- Products are organised into categories: **Cleaners**, **Sealers**, **Aerosols**.
- A horizontal scrollable chip-style tab bar allows filtering by a single category or All.

#### Real-Time Search
- A search bar filters products by name or description as the user types.

#### Pricing Level Display
- A pricing level selector at the top shows the currently active pricing level.
- Prices shown on every product card update live to reflect the selected pricing level.

#### ProductCard Component
Each product shows:
- Product name, category badge, description
- All size/type variants with SKU and price (adjusted per pricing level)
- "Add to Cart" button per variant

---

## 6. B2B Pricing Level System

### Overview
A full tiered pricing engine that gives admins complete control over pricing while keeping salespeople focused on selling.

### Admin: Pricing Management Page
Accessible from **More → Pricing Management** (admin only).

#### Create a New Pricing Level
- A "+" button opens an inline form to enter name and optional description.
- Saved via `POST /api/pricing-levels`.

#### Edit a Pricing Level
- Edit button modifies name and description in place.
- Saved via `PUT /api/pricing-levels/:id`.

#### Delete a Pricing Level
- Trash icon sends `DELETE /api/pricing-levels/:id`.
- The Retail level is protected and cannot be deleted.

#### Set Per-SKU Prices
- Expanding a pricing level card reveals a full product/variant price table.
- Each row is an editable input field for a specific variant SKU's price.
- The complete `prices` JSONB object is saved on each PUT.

### Demo Pricing Levels

| Level Name | Description                              |
|------------|------------------------------------------|
| Retail     | Standard RRP pricing (default/protected) |
| Wholesale  | Bulk discount pricing for distributors   |
| Level 1    | Preferred partner pricing                |

### Salesman: Applying a Pricing Level
- In the Catalog, a pricing selector at the top allows the salesman to switch levels.
- The `getAdjustedPrice(sku, basePrice)` function looks up the SKU price in the selected level's `prices` JSONB and falls back to retail base price if not found.
- All product cards immediately re-render with the new prices.
- In the Cart, the active pricing level name is shown in the header.
- The selected pricing level ID is saved to `orders.pricing_level_id` in the database.

---

## 7. Shopping Cart

### Overview
The Cart is a full-featured order preparation screen managing line items, calculating totals, handling customer assignment, and submitting the order to the database.

### Features

#### Active Pricing Level Badge
- The cart header shows which pricing level is active (e.g. "Wholesale Pricing").

#### Line Item Management
- Each item shows: Product name, variant details (size / SKU), unit price (adjusted for pricing level), quantity stepper (+/−), line total, and remove button.

#### Order Totals

| Line        | Calculation                            |
|-------------|----------------------------------------|
| Subtotal    | Sum of all (price × quantity)          |
| Discount    | 5% of subtotal (applied automatically)|
| GST (Tax)   | 10% of (subtotal − discount)           |
| Grand Total | Subtotal − Discount + Tax              |

#### Customer Assignment Panel
Before submitting, a customer must be linked. Two flows are available:

**Existing Customer:**
- A search modal lists all customers from the database.
- Tapping a customer card populates their name, address, phone, and email into the order.

**New Customer:**
- A form inside the modal allows entering: Name (required), Address, Phone, Email.
- On "Create & Select", a `POST /api/customers` call saves the new customer to the database permanently.
- The new customer is immediately selectable without a page refresh.

#### Order Submission
- "Submit Order" button is disabled until a customer is selected.
- Sends a `POST /api/orders` with all cart items, totals, customer details, pricing level ID, and the salesman's user ID.
- On success: cart is cleared, customer is deselected, success toast shown.

---

## 8. Customer Management

### Overview
The Customers page is the CRM directory — a searchable and filterable list of all accounts.

### Features

#### Live Data Fetch
- Fetched from `GET /api/customers` (Supabase `customers` table).

#### Search
- Real-time filter by name or address.

#### Status Filter Tabs

| Status  | Meaning                             |
|---------|-------------------------------------|
| All     | Show every customer                 |
| Pending | Not yet visited this cycle          |
| Visited | Called on / check-in recorded       |
| Overdue | Visit is overdue (past due date)    |

#### Customer Card
Each card shows: Store name, address, phone number, visit status badge (colour-coded), last visit date.

---

## 9. Customer Details Page

### Overview
A full-detail profile page for an individual customer.

### Features

#### Customer Header
- Store name, status badge (Visited / Pending / Overdue) with icon and colour.

#### Quick Contact Actions
- Call button (pre-fills phone number)
- New Order button — navigates to Catalog with customer pre-selected

#### Contact Info Cards
- Physical address, phone number, email address, last visit timestamp.

#### Pricing Level Assignment
- A dropdown shows all available pricing levels.
- Selecting a new level immediately fires `PUT /api/customers/:id` to persist.
- Allows locking in the correct pricing context per account.

#### Order History for Customer
- Lists past orders: Order ID, date, item count, total, delivery status badge.

#### Payment History for Customer
- Lists past payments: Payment ID, date, amount, payment method, status.

---

## 10. Order Submission Flow

End-to-end journey from product selection to database:

```
Catalog → Add Products to Cart
    ↓
Cart → Review Items & Totals
    ↓
Select Customer (existing from DB or create new)
    ↓
Submit Order (POST /api/orders)
    ↓
Backend inserts into `orders` table
(id, customer_id, customer_name, address, phone, email,
pricing_level_id, subtotal, discount, tax, grand_total, user_id)
    ↓
Backend inserts each line item into `order_items` table
(order_id, variant_sku, variant_name, product_name, price, quantity)
    ↓
Cart cleared, success toast shown
    ↓
Order visible in: Order History, Admin Dashboard, Sales Portal
```

---

## 11. Order History Portal

### Overview
A dedicated page for reviewing all past orders, scoped by role. Accessed via **More → Order History**.

### Features

#### Search Bar
- Real-time filter by order number, store name, or product.

#### Role-Based Filtering
- **Admin:** Sees every order across the whole business.
- **Salesman:** Sees only their own orders (filtered by `userId === user.id`).

#### Salesman Attribution (Admin View)
- Each order card shows **"SOLD BY [NAME]"** so Kevin can see which rep generated each sale.

#### Order Cards
Each card shows:
- Order # (last 6 digits of DB ID)
- Date placed
- Grand Total (AUD currency)
- Completed status badge
- Order Summary: each product name with quantity

---

## 12. Sales Portal (Team Management)

### Overview
The admin's live team management hub. Accessible via the **Sales Portal** tab in the bottom navigation.

### Features

#### Active Representatives List
- Fetches all salesmen from `GET /api/users`.
- Cross-references `GET /api/orders` to compute real metrics per rep.

#### Rep Card (List View)
Each rep card shows:
- Initials avatar
- Full name + trend arrow (up if KPI > 50%, down otherwise)
- Designated region
- Revenue generated (real sum from DB orders)
- KPI % (`revenue / $20,000 monthly target × 100`, capped at 100%)

#### Rep Detail View
Tapping a rep navigates to their performance page:
- Phone and Email contact buttons
- Performance Ring (KPI gauge with real data)
- MTD Sales Card (actual dollar amount from DB)
- Orders Processed Card (actual count from DB)
- Latest Activity Feed (recent check-ins and orders)

---

## 13. Analytics Page

### Overview
Deeper view into a sales rep's own performance. Accessed via **More → My Analytics**.

### Features
- **Performance Ring:** Circular KPI gauge (percentage, revenue, order counts)
- **Commission Card:** Estimated commission earned for the month with % change vs prior month
- **Average Order Value Card:** Average order size with % change vs prior month
- **Sales Trend Chart:** Recharts-powered bar/line chart showing revenue over time

> Note: Commission and Average Order figures are static demo values. Future iteration will compute from the database.

---

## 14. User Profile

### Overview
View and edit personal profile details. Accessed via **More → My Profile**.

### Features
- **Avatar:** Auto-generated initials from the user's full name
- **Role Badge:** Administrator or Sales Representative
- **Editable Fields:** Full Name, Email, Phone Number
- **Read-only Fields:** Designated Region, Administrative Role (admin only)
- **Save Changes:** Confirmation toast (full DB write-back planned for future)

---

## 15. App Settings

### Overview
System-level configuration toggles. Accessed via **More → App Settings**.

### Feature Toggles

| Setting                  | Description                                               | Default |
|--------------------------|-----------------------------------------------------------|---------|
| Offline Mode             | Pre-downloads catalog for fieldwork without internet      | On      |
| Auto-Sync Orders         | Syncs pending orders when network returns                 | On      |
| GPS Tracking             | Auto-suggests nearby customer visits via device GPS       | On      |
| Push Notifications       | Alerts for new assignments and order updates              | On      |
| High-Res Barcode Scanner | Higher resolution camera mode for scanning (uses more battery) | Off |
| Share Analytics          | Opt-in to anonymised usage data                           | On      |

All toggles use Switch components and show confirmation toasts on change.

#### Clear App Cache
- Button removes locally cached data and shows a confirmation toast.

---

## 16. Navigation & Layout

### Mobile-First Layout
- Entire app designed as a mobile-first PWA-style interface (`max-w-[430px]` container).
- All pages use the `MobileLayout` wrapper for consistent background, fonts, and bottom nav.

### Bottom Navigation Bar

| Tab          | Route           | Visible To |
|--------------|-----------------|------------|
| Dashboard    | `/dashboard`    | All        |
| Customers    | `/customers`    | All        |
| Sales Portal | `/sales-portal` | All        |
| More         | `/more`         | All        |

### More Menu

| Item                | Route                 | Notes                          |
|---------------------|-----------------------|--------------------------------|
| My Profile          | `/profile`            | All users                      |
| My Analytics        | `/analytics`          | All users                      |
| Order History       | `/history`            | Filtered by role               |
| Export Data         | (action)              | Toast notification             |
| Reports             | (action)              | Toast notification             |
| Pricing Management  | `/pricing-management` | Admin sets prices              |
| App Settings        | `/settings`           | All users                      |
| Help & Support      | `/help`               | All users                      |
| Sign Out            | → `/login`            | Clears session                 |

---

## 17. Backend API

Express.js backend on port **3001**, proxied through Vite on port **8080** for development. Uses `npx nodemon` for hot-reload.

### Endpoints

| Method | Endpoint                   | Description                                    |
|--------|----------------------------|------------------------------------------------|
| POST   | `/api/login`               | Authenticate user against `users` table        |
| GET    | `/api/users`               | Fetch all users (id, name, role, region, etc.)|
| GET    | `/api/products`            | Fetch all products with nested variants        |
| GET    | `/api/pricing-levels`      | Fetch all pricing levels with SKU prices       |
| POST   | `/api/pricing-levels`      | Create a new pricing level                     |
| PUT    | `/api/pricing-levels/:id`  | Update an existing pricing level               |
| DELETE | `/api/pricing-levels/:id`  | Delete a pricing level                         |
| GET    | `/api/customers`           | Fetch all customers                            |
| POST   | `/api/customers`           | Create a new customer                          |
| PUT    | `/api/customers/:id`       | Update a customer's details or pricing level   |
| GET    | `/api/orders`              | Fetch all orders with items (joined with users)|
| POST   | `/api/orders`              | Submit a new order with all line items         |

### Key Backend Features
- **Direct PostgreSQL connection** via `pg` client (bypasses ISP-blocked Supabase REST domain)
- **SQL JOIN:** `GET /api/orders` joins `users` to attach the salesman's name to each order
- **Parameterised queries** throughout to prevent SQL injection
- **Hot-reload:** `npx nodemon` auto-restarts backend on code changes
- **Static serving:** In production, serves compiled `/dist` frontend folder

---

## 18. Database Architecture (Supabase)

Hosted on **Supabase** (PostgreSQL). Direct session-pooler connection is used.

### `users`
| Column     | Type      | Notes                          |
|------------|-----------|--------------------------------|
| id         | text      | Primary key (e.g. `rep-1`)    |
| username   | text      | Unique login name              |
| password   | text      | Plain-text (demo only)         |
| name       | text      | Display name                   |
| role       | text      | `admin` or `salesman`          |
| region     | text      | Designated sales region        |
| phone      | text      | Contact phone                  |
| email      | text      | Contact email                  |
| created_at | timestamp | Auto-set on insert             |

### `products`
| Column      | Type | Notes                                   |
|-------------|------|-----------------------------------------|
| id          | text | Primary key                             |
| name        | text | Product name                            |
| description | text | Marketing description                   |
| category    | text | cleaners / sealers / aerosols           |

### `product_variants`
| Column     | Type    | Notes                          |
|------------|---------|--------------------------------|
| id         | text    | Primary key                    |
| product_id | text    | FK → products.id               |
| sku        | text    | Unique SKU code                |
| name       | text    | Variant label (e.g. `1L`)      |
| price      | numeric | Base retail price (AUD)        |

### `pricing_levels`
| Column      | Type  | Notes                                   |
|-------------|-------|-----------------------------------------|
| id          | text  | Primary key (e.g. `retail`)            |
| name        | text  | Display name                            |
| description | text  | Short description                       |
| prices      | jsonb | Map of `{ "SKU": price, ... }`          |

### `customers`
| Column           | Type | Notes                          |
|------------------|------|--------------------------------|
| id               | text | Primary key                    |
| name             | text | Business / store name          |
| address          | text | Physical address               |
| phone            | text | Contact phone                  |
| email            | text | Contact email                  |
| status           | text | visited / pending / overdue    |
| last_visit       | text | Date of last visit             |
| outstanding      | text | Outstanding balance (display)  |
| pricing_level_id | text | FK → pricing_levels.id         |

### `orders`
| Column           | Type      | Notes                              |
|------------------|-----------|------------------------------------|
| id               | text      | Primary key (timestamp-based)      |
| user_id          | text      | FK → users.id (the salesman)       |
| customer_id      | text      | FK → customers.id                  |
| customer_name    | text      | Snapshot at time of order          |
| customer_address | text      | Snapshot                           |
| customer_phone   | text      | Snapshot                           |
| customer_email   | text      | Snapshot                           |
| pricing_level_id | text      | FK → pricing_levels.id             |
| subtotal         | numeric   | Before discount                    |
| discount         | numeric   | 5% discount amount                 |
| tax              | numeric   | 10% GST                            |
| grand_total      | numeric   | Final payable amount               |
| created_at       | timestamp | Auto-set on insert                 |

### `order_items`
| Column       | Type    | Notes                              |
|--------------|---------|------------------------------------|
| id           | uuid    | Primary key                        |
| order_id     | text    | FK → orders.id                     |
| variant_sku  | text    | SKU of the variant ordered         |
| variant_name | text    | Snapshot of variant name           |
| product_name | text    | Snapshot of product name           |
| price        | numeric | Price at time of order             |
| quantity     | integer | Units ordered                      |

---

## Future Roadmap

| Feature                         | Description                                                               |
|---------------------------------|---------------------------------------------------------------------------|
| Neto by Maropost Integration    | Sync orders, products, customers with Neto ERP/eCommerce platform        |
| Live GPS Check-In               | Real-time GPS check-in logging tied to customer records                   |
| Barcode Scanner                 | Camera-based SKU lookup to add products instantly                         |
| PDF Invoice Generation          | Export a signed PDF invoice for each order                                |
| Push Notifications              | Real-time alerts for new assignments and visit reminders                  |
| Offline Mode (PWA)              | Service worker-based offline support with local sync queue                |
| Password Hashing                | Replace plain-text passwords with bcrypt                                  |
| Commission Tracking             | Auto-calculate and display commissions per rep from live data             |
| Real-Time Analytics             | Replace static demo analytics with live database-driven charts            |
| Customer Pricing Lock           | Auto-apply the correct pricing level when a customer is selected          |
| Overdue Visit Alerts            | Notifications for customers not visited in X days                         |
| Admin User Management           | Create, edit, deactivate user accounts from within the app                |

---

*Last updated: 2 March 2026*
