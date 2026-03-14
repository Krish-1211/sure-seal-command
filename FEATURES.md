# Sure Seal SFA — Field Sales Automation Platform
## Complete Feature Documentation

> **Version:** 1.2.0  
> **Stack:** React + TypeScript (Vite), Node.js / Express backend, PostgreSQL via Supabase  
> **Infrastructure:** Vercel (Serverless), Firebase Cloud Messaging, IndexedDB (Offline)

---

## Table of Contents

1. [Authentication System](#1-authentication-system)
2. [Role-Based Access Control (RBAC)](#2-role-based-access-control-rbac)
3. [Admin Dashboard](#3-admin-dashboard)
4. [Salesman Dashboard](#4-salesman-dashboard)
5. [Customer Portal](#5-customer-portal)
6. [Product Catalog & Recommendation Engine](#6-product-catalog--recommendation-engine)
7. [B2B Pricing Level System](#7-b2b-pricing-level-system)
8. [Shopping Cart & Order Drafting](#8-shopping-cart--order-drafting)
9. [Customer Management](#9-customer-management)
10. [Order Submission & Lock Window](#10-order-submission--lock-window)
11. [Order History & PDF Invoices](#11-order-history--pdf-invoices)
12. [Customer Visit Route & Check-In](#12-customer-visit-route--check-in)
13. [Fleet Tracker (Admin GPS)](#13-fleet-tracker-admin-gps)
14. [Real-Time Messaging & Notifications](#14-real-time-messaging--notifications)
15. [Promotion & Offers Management](#15-promotion--offers-management)
16. [Target & KPI Management](#16-target--kpi-management)
17. [Offline Support & Sync](#17-offline-support--sync)
18. [Backend API Architecture](#18-backend-api-architecture)
19. [Database Architecture (Supabase)](#19-database-architecture-supabase)
20. [Deployment & Performance](#20-deployment--performance)

---

## 1. Authentication System

### Overview
Secure, database-driven login system.

### Features
- **Secure Hashing:** `POST /api/login` utilizes **bcryptjs** for credential verification.
- **JWT Session management:** Signed JSON Web Tokens (JWT) stored in `localStorage`.
- **Session Persistence:** Auto-refresh logic on every visit.
- **Token Revocation:** `revoked_tokens` table allows global logout/deactivation.
- **Auto-Logout:** Handled by `apiFetch` wrapper for 401/403 errors.

---

## 2. Role-Based Access Control (RBAC)

### Admin Capabilities
- **Fleet Tracker:** Live GPS map of all reps.
- **Team Analytics:** Monitor revenue vs targets for the entire company.
- **Pricing Control:** Manage Tiered Pricing and SKU updates.
- **Promotions:** Create and toggle marketing offers.
- **User Management:** Deactivate accounts or assign customers to reps.

### Salesman Capabilities
- **Fieldwork Tools:** Access Visit Route, Check-Ins, and Catalog.
- **Order Management:** Manage personal drafts and order history.
- **Performance tracking:** Individual KPI ring and sales trends.

### Customer Capabilities
- **Direct Ordering:** Customer-facing portal for direct B2B purchases.
- **Marketing:** View active promotions and "Buy It Again" recommendations.
- **History:** Access own invoices and reorder past items.

---

## 3. Admin Dashboard
- **Total Revenue:** Aggregated `grandTotal` across all segments.
- **Rep Leaderboard:** Quick view of top-performing sales reps.
- **Quick Links:** One-tap access to Fleet Map, Targets, and Messages.
- **Recent Feed:** Chronological list of all business-wide orders.

---

## 4. Salesman Dashboard
- **Next Stop Card:** Real-time priority customer based on visit frequency.
- **Sync Indicator:** Visual status of local database synchronization.
- **Quick Actions:** New Order, Check In, Route Plan.
- **Performance Ring:** Visual progress toward individual monthly revenue target.

---

## 5. Customer Portal
- **Marketing Banners:** Dynamic carousel showing current offers.
- **Quick Reorder:** "Buy It Again" card for the latest confirmed order.
- **History Access:** Integrated view for tracking past orders.

---

## 6. Product Catalog & Recommendation Engine

### Catalog Features
- **Categorization:** Smart tabs (Cleaners, Sealers, Aerosols).
- **Search:** Deep search across product handles and descriptions.
- **Pricing Logic:** Automatic application of customer-specific B2B levels.

### Recommendation Engine (In-Development)
- **Fallback Strategy:** Multi-tiered recommendations if collaborative filtering isn't available:
  1. Collaborative filtering (similar users).
  2. Category-based matches.
  3. Latest seasonal products.

---

## 7. B2B Pricing Level System
- **JSONB Prices:** High-performance storage of SKU-level price overrides.
- **Bulk Import:** CSV-based pricing bulk updates for specific tiers.
- **Management UI:** Admin-only interface for fine-tuning prices per level.

---

## 8. Shopping Cart & Order Drafting
- **Draft Orders:** Save current cart status to resume later (essential for site visits).
- **Custom Discounts:** Apply percentage-based discounts with admin-defined caps.
- **Credit Limit Checks:** Real-time warning if order value + balance exceeds limit.
- **Salesman Attribution:** Automatic linking of authenticated rep to the order.

---

## 9. Customer Management
- **Assignment Logic:** Admins can pair customers with specific sales representatives.
- **Visit Tracking:** Auto-set `last_visit` upon successful check-in.
- **Pricing Defaults:** Link customers to specific Pricing Levels 1-3 or Wholesale.

---

## 10. Order Submission & Lock Window
- **Sequential IDs:** Human-readable order numbering (e.g., #1001).
- **Windowed Editing:** 15-minute post-submission window for reps to edit or cancel orders.
- **Warehouse Lock:** Orders auto-lock after 15 minutes to prevent processing conflicts.

---

## 11. Order History & PDF Invoices
- **Branded Invoices:** Dynamic PDF generation using `jsPDF` with branding, GST, and SKU details.
- **Reorder Logic:** Instant pre-population of cart from past order snapshots.
- **Status tracking:** Distinguish between Confirmed, Processing, and Cancelled states.

---

## 12. Customer Visit Route & Check-In
- **Mapping:** Integrated Leaflet + OpenStreetMap with custom markers.
- **Routing:** On-device driving path calculation using OSRM.
- **Visit Logging:** Log întâlniri with notes and field-captured photos.
- **Photo Storage:** native camera integration with Supabase storage upload.

---

## 13. Fleet Tracker (Admin GPS)
- **Live Monitoring:** Real-time map displaying location of all reps.
- **Heartbeat:** 45-second updates while the app is active in the field.
- **Online status:** Visual indicator based on `location_updated_at` threshold (5 min).

---

## 14. Real-Time Messaging & Notifications
- **Internal Chat:** Direct communication between Reps and Admin.
- **Push Notifications:** Firebase Cloud Messaging (FCM) integration.
- **Service Workers:** Custom SW handles background notification delivery on Vercel.
- **Unread Badges:** Dynamic counting for messages and system alerts.

---

## 15. Promotion & Offers Management
- **Offer Engine:** CRUD management of marketing banners.
- **Visibility Toggles:** Enable/Disable offers instantly for customer dashboards.
- **Rich Media:** Support for banner images and descriptive marketing copy.

---

## 16. Target & KPI Management
- **Monthly Revenue Goals:** Specific targets set per representative ($).
- **Performance tracking:** Percentage calculation of Sold Revenue vs Monthly Target.
- **Trend indicators:** Visual "Up/Down" trends compared to period averages.

---

## 17. Offline Support & Sync
- **Vite PWA:** Installable application with full asset caching.
- **IndexedDB:** Local storage of critical data for offline access:
  - `customers`, `products`, `pricing_levels`.
- **Offline Actions:** Queue orders and check-ins while offline to sync later.

---

## 18. Backend API Architecture
- **Environment:** Express.js on Node 20+.
- **Authorisation:** `requireAuth` and `requireAdmin` middleware.
- **Efficiency:** Reduced connection pooling to prevent Supabase session exhaustion in serverless mode.

---

## 19. Database Architecture (Supabase)
### Core Extensions
- `gen_random_uuid()` for primary keys.
- `pg` driver with connection resilience.
- Sequential sequences for order numbers.

---

## 20. Deployment & Performance
- **Hosting:** Vercel (Front-end + Serverless Functions).
- **Optimization:** Image compression on check-ins to reduce DB storage overhead.
- **SSL Enforcement:** Mandated for all database and API traffic.

---

## Completed Roadmap Highlights
- [x] Push Notifications (FCM).
- [x] Offline Database (IndexedDB).
- [x] Pricing Bulk Import (CSV).
- [x] Multi-user RBAC system.
- [x] Real-time Messaging.

---
*Last updated: 14 March 2026*
