# Sure Seal SFA — Field Sales Automation Platform
## Complete Feature Documentation

> **Version:** 1.1.0  
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
7. [Shopping Cart & Order Drafting](#7-shopping-cart--order-drafting)
8. [Customer Management](#8-customer-management)
9. [Customer Details Page](#9-customer-details-page)
10. [Order Submission & Lock Window](#10-order-submission--lock-window)
11. [Order History & PDF Invoices](#11-order-history--pdf-invoices)
12. [Customer Visit Route & Check-In](#12-customer-visit-route--check-in)
13. [Fleet Tracker (Admin GPS)](#13-fleet-tracker-admin-gps)
14. [Real-Time Messaging](#14-real-time-messaging)
15. [Sales Portal (Team Management)](#15-sales-portal-team-management)
16. [Analytics Page](#16-analytics-page)
17. [User Profile](#17-user-profile)
18. [App Settings](#18-app-settings)
19. [Navigation & Layout](#19-navigation--layout)
20. [Backend API](#20-backend-api)
21. [Database Architecture (Supabase)](#21-database-architecture-supabase)
22. [Deployment & Production](#22-deployment--production)

---

## 1. Authentication System

### Overview
The login system is fully database-driven. Passwords are now hashed using **bcrypt** on the backend, securing user credentials for production use.

### Features
- **Secure Hashing:** `POST /api/login` verifies bcrypt hashes rather than plaintext.
- **JWT Session:** On login, the server returns a signed JWT token stored in `localStorage`.
- **Session Persistence:** User data is stored in `localStorage`, but critical actions (roles/access) are re-validated server-side via JWT.
- **Auto-Logout:** All `apiFetch` calls catch 401/403 errors to clear expired sessions and redirect to login.

### Current Demo Accounts

| Username  | Role      | Region         |
|-----------|-----------|----------------|
| kevin     | Admin     | Head Office    |
| scott     | Salesman  | Melbourne SE   |
| sarah     | Salesman  | Sydney North   |
| michael   | Salesman  | Brisbane       |

---

## 2. Role-Based Access Control (RBAC)

### Overview
Hardened server-side authorization ensures users can only access data intended for their role.

### Admin Capabilities
- Access **Fleet Tracker** to view live GPS positions of all reps.
- Filter team-wide orders and revenue data.
- Manage global **Pricing Levels** and **Monthly Targets**.
- Restricted tabs (Sales Portal, Fleet Map) are hidden from salesmen.

### Salesman Capabilities
- View personal **Visit Route** sorted by priority.
- Share GPS location heartbeats while planning routes.
- Submit orders and manage their assigned customers.
- Limited only to their own order history and analytics.

---

## 3. Admin Dashboard

### Features
- **Total Revenue:** Sum of all `grandTotal` from the `orders` table.
- **Rep Performance:** Quick summary of total orders compared to active target.
- **Fleet Tracker Card:** One-tap access to the live GPS fleet map.
- **Recent Feed:** Consolidated history of all orders across the business.

---

## 4. Salesman Dashboard

### Features
- **Next Stop Card:** Live link to **/route**. Dynamically displays the single most-overdue customer (e.g., "Bunnings Port Melbourne - Tap to navigate").
- **Message Badge:** Real-time unread count indicator on the header chat icon.
- **Quick Actions:**
  - **New Order:** Direct to Catalog.
  - **Check In:** Direct to Route page for store visit logging.
  - **Route Plan:** Direct to Route page for map viewing.
- **Performance Summary:** Ring gauge showing progress toward the individual monthly quota.

---

## 5. Product Catalog

### Features
- **Category Filtering:** Horizontal tabs for Cleaners, Sealers, and Aerosols.
- **B2B Price Logic:** Prices update instantly when switching between Retail, Wholesale, or Level 1-3 tiers.
- **Auto-Customer Pricing:** If a customer is selected in the cart, the Catalog auto-switches to that customer's assigned pricing level.

---

## 6. B2B Pricing Level System

### Admin: Pricing Management
- **JSONB Prices:** Prices are stored in a key-value map on the `pricing_levels` table.
- **Full Control:** Admins can edit any price for any SKU at any level without touching code.

---

## 7. Shopping Cart & Order Drafting

### Features
- **Custom Discounts:** Salespeople can now apply a custom percentage or dollar discount per order.
- **Drafts:** Ability to "Save as Draft" allows reps to leave a cart and resume it later (useful for interrupted site visits).
- **Credit Limit Warnings:** If a customer's outstanding balance + current order exceeds their limit, a warning is displayed before submission.
- **Confirmation Sheet:** A slider or confirm button prevents accidental order submissions.

---

## 8. Customer Management

### Features
- **Sorting:** Priority sorting based on `last_visit` timestamp.
- **Pricing Assignment:** Every customer record holds a `pricing_level_id` which defines their default catalog prices.

---

## 10. Order Submission & Lock Window

### Features
- **Sequential Numbering:** Order IDs are now clean, sequential numbers (e.g. #1001, #1002) for professional invoicing.
- **15-Minute Edit Window:** After submission, an order remains "Unlocked" for 15 minutes. Reps can Edit or Cancel the order independently. After 15 minutes, the order locks to prevent changes once warehouse processing starts.

---

## 11. Order History & PDF Invoices

### Features
- **Branded jsPDF Invoices:** Tapping "PDF" on any order generates a professional invoice:
  - Sure Seal Sealants logo & branding.
  - Snapshot of customer billing details.
  - Sold By rep attribution.
  - Full items table with GST (10%) calculations.
- **Reorder:** One-tap "Reorder" button clones a past order's items directly back into the cart.

---

## 12. Customer Visit Route & Check-In

### Page: `/route`
The core fieldwork tool for sales reps.
- **In-App Navigation:** Fully integrated map powered by **Leaflet & OpenStreetMap**.
- **Geocoded Routes:** Uses OSRM to draw driving paths from "My Location" to "Store Location" without leaving the app.
- **Visit Priority:** Customers sorted by "Days since last visit" (Overdue > 14 days).
- **Check-In Flow:**
  - **Photo Capture:** Native camera integration with **Canvas Compression** to save DB space.
  - **Visit Notes:** Textarea for recording meeting outcomes.
- **Visit Log:** Chronological list of today's successfully completed check-ins.

---

## 13. Fleet Tracker (Admin GPS)

### Page: `/fleet`
Real-time rep monitoring for business owners.
- **Fleet Map:** Multi-marker map showing high-level positions of all reps.
- **Status Indicator:** Shows "Online" (active in last 5 min) or "Offline".
- **Rep Focus:** Click any rep to expand their individual map view and see their exact coordinates.
- **Heartbeat:** Salesman location is sent every 45sec while they have the Route page open.

---

## 14. Real-Time Messaging

### Features
- **Salesman → Admin Chat:** Reps can message head office directly from the dashboard.
- **Unread Badges:** Floating badges on the dashboard header ensure no messages are missed.
- **Badge Count:** Total unread messages shown in the header icon.

---

## 20. Backend API

### GPS & Fleet Endpoints
- `POST /api/location`: Salesman heartbeat updates (`lat`, `lng`).
- `GET /api/fleet`: Admin-only view of all rep positions.
- `GET /api/check-ins`: Retrieve check-in logs and photo flags.
- `POST /api/check-ins`: Log visit + update customer `last_visit`.

---

## 21. Database Architecture (Supabase)

### `check_ins` (New Table)
| Column        | Type        | Notes                                |
|---------------|-------------|--------------------------------------|
| id            | uuid        | Primary key                          |
| user_id       | text        | FK → users.id                        |
| customer_id   | text        | FK → customers.id                    |
| customer_name | text        | Denormalized for log display         |
| notes         | text        | Long-form visit summary              |
| photo_data    | text (base64)| Compressed JPEG image (~150KB)       |
| created_at    | timestamp   | Auto-set                             |

### `users` (Updated)
| Column                | Type      | Notes                               |
|-----------------------|-----------|-------------------------------------|
| last_lat              | numeric   | Latest GPS Latitude                 |
| last_lng              | numeric   | Latest GPS Longitude                |
| location_updated_at   | timestamp | Heartbeat timestamp                 |

---

## 22. Deployment & Production

### Vercel Integration
- **Serverless Backend:** Ported to run inside Vercel Functions.
- **Connection Pooling:** Uses `pg.Pool` to manage Supabase Postgres connections efficiently in a serverless context.
- **SSL Enforcement:** Secure connections required for production database access.

---

## Completed Roadmap Items (Moving to Features)
- [x] Password Hashing (Bcrypt)
- [x] Live GPS Check-In & Fleet Tracking
- [x] PDF Invoice Generation
- [x] Customer Pricing Auto-Lock
- [x] Order Edit/Cancel Window
- [x] Sequential Order Numbering
- [x] Unread Message Badges

---

*Last updated: 3 March 2026*
