# Sure Seal SFA — Field Sales Automation Platform
## Project Analysis & Specification

> **Version:** 1.1.0  
> **Status:** Active Development / In Production  
> **Primary Use Case:** Field Sales Management & B2B Order Automation  

---

## 1. Project Overview
**Sure Seal SFA** is a comprehensive Field Sales Automation (SFA) platform designed for sales representatives and business administrators. It streamlines the process of store visits, order placement with tiered pricing, real-time location tracking, and team performance analytics.

---

## 2. Technology Stack

### **Frontend**
- **Framework:** React 18 with Vite (TypeScript)
- **State Management:** React Context API (Auth, Cart, Customer)
- **Routing:** React Router DOM v6
- **Data Fetching:** TanStack Query (React Query)
- **UI Components:** 
  - **shadcn/ui** (Radix UI primitives)
  - **Tailwind CSS** for styling
  - **Lucide React** for iconography
  - **Embla Carousel** (for promotions)
- **Maps API:** 
  - **Leaflet** & **OpenStreetMap** for geolocation and routing
  - **OSRM** (Open Source Routing Machine) for driving paths
- **Utilities:** 
  - **Zod & React Hook Form** for validation
  - **jsPDF** for on-the-fly invoice generation
  - **date-fns** for time calculations

### **Backend**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Authentication:** 
  - **JWT (JSON Web Tokens)** for session management
  - **bcryptjs** for secure password hashing
- **File Handling:** **Multer** (for photo uploads/temporary storage)

### **Database (Infrastructure)**
- **Platform:** **Supabase** (PostgreSQL)
- **Schema:** 
  - Relational PostgreSQL tables managed via `pg` driver
  - **JSONB** storage for flexible pricing mapping
- **Deployment:** **Vercel** (Serverless backend + static frontend)

---

## 3. Database Schema (PostgreSQL)

### **Core Tables**
1.  **`users`**:
    - **Fields:** `id`, `username`, `password` (hashed), `name`, `role` (Admin/Salesman), `region`, `monthly_target`, `last_lat`, `last_lng`, `location_updated_at`.
    - **Usage:** Manages authentication, RBAC, and GPS heartbeats.
2.  **`customers`**:
    - **Fields:** `id`, `name`, `address`, `phone`, `email`, `status`, `last_visit`, `outstanding_balance`, `credit_limit`, `pricing_level_id`.
    - **Usage:** CRM data for sales visits and order defaults.
3.  **`products` & `product_variants`**:
    - **Fields:** `handle`, `name`, `description`, `category`, `image_url`, `sku`, `price`, `stock`, `is_active`.
    - **Usage:** Master product listing with soft-delete support and high-res image links.
4.  **`pricing_levels`**:
    - **Fields:** `id`, `name`, `description`, `prices` (**JSONB**).
    - **Usage:** Stores custom prices for every SKU across different B2B tiers (Wholesale, Level 1-3, etc.).
5.  **`orders` & `order_items`**:
    - **Fields:** `order_number` (seq), `customer_id`, `subtotal`, `grand_total`, `tax`, `discount`, `locked_at`, `status` (confirmed/cancelled), `items` (SKU, quantity, price snapshot).
    - **Usage:** Records all transactional data.
6.  **`check_ins`**:
    - **Fields:** `user_id`, `customer_id`, `notes`, `photo_data` (Base64 JPEG), `created_at`.
    - **Usage:** Logs of physical site visits by sales reps.
7.  **`messages`**:
    - **Fields:** `from_user_id`, `to_user_id`, `body`, `is_read`.
    - **Usage:** Internal real-time communication.
8.  **`promotions`**:
    - **Fields:** `title`, `image_url`, `active`.
    - **Usage:** Marketing banners displayed on the dashboard.

---

## 4. Key Features & Use Cases

### **A. Sales Representative Workflow**
1.  **Route Planning (`/route`)**: 
    - Sales reps view a prioritized list of customers based on visit frequency.
    - An interactive map calculates the driving route from their current GPS position to the store.
2.  **Site Visit & Check-In**:
    - Upon arrival, the rep logs a "Check-In" including visit notes and a photo capture (native camera).
    - The customer's `last_visit` status is automatically updated.
3.  **Order Drafting & Catalog**:
    - Reps can "Save as Draft" for interrupted visits.
    - The Catalog automatically applies the specific customer's B2B pricing tier.
    - Orders follow a 15-minute "Lock Window" post-submission for final edits.
4.  **GPS Heartbeat**:
    - Real-time location is sent to the server every 45 seconds while using the route planner.

### **B. Administrative Control (`Admin Dashboard`)**
1.  **Fleet Tracking (`/fleet`)**:
    - Live map viewing of all sales representatives' current locations and online status.
2.  **Pricing Management**:
    - Global adjustment of SKU prices across all B2B levels via a central dashboard or CSV import.
3.  **Sales Performance**:
    - Tracking total revenue vs. monthly targets per representative.
4.  **Service Ticketing & Messages**:
    - Centralized hub for managing unread messages from the field team.

---

## 5. File-by-File Details

| Path | Purpose |
|------|---------|
| `server/server.js` | Main API hub. Handles Auth logic, SQL queries, and GPS updates. |
| `src/contexts/AuthContext.tsx` | Manages JWT storage and user session state. |
| `src/contexts/CartContext.tsx` | Logic for customer selection, pricing logic, and item management. |
| `src/pages/VisitRoute.tsx` | Core fieldwork page (Leaflet maps + Check-in logic). |
| `src/pages/FleetMap.tsx` | Admin-only view of representative GPS markers. |
| `src/pages/Cart.tsx` | Shopping cart with discount logic and order submission. |
| `src/pages/Catalog.tsx` | Product browsing with tiered price calculations. |
| `migrate_to_postgres.cjs` | Seed script for initializing schema and demo data. |
| `tailwind.config.ts` | Design system tokens for consistency. |

---

## 6. API Endpoints

- **Auth:** `POST /api/login` (Auto-purges expired tokens)
- **Catalog:** `GET /api/products`, `GET /api/pricing-levels` (Paginated)
- **Customers:** `GET /api/customers`, `POST /api/customers`, `PUT /api/customers/:id` (Paginated, Soft Delete)
- **Orders:** `GET /api/orders`, `POST /api/orders`, `PATCH /api/orders/:id/cancel` (Paginated)
- **GPS/Fleet:** `POST /api/location`, `GET /api/fleet`
- **Visits:** `POST /api/check-ins`, `GET /api/check-ins` (With Client-side compression)
- **Messaging:** `GET /api/messages`, `POST /api/messages` (Broadcast support)
