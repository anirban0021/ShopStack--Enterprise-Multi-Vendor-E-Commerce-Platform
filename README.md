# ShopStack - Enterprise Multi-Vendor E-Commerce Platform

ShopStack is a full-stack, enterprise-grade multi-vendor e-commerce platform built with Spring Boot for the backend RESTful API services and React.js (Vite) for the frontend client layer.

---

## 🛠️ Tech Stack & Prerequisites

### Backend
* **Language:** Java 26
* **Framework:** Spring Boot 4.1.0
* **Security:** Spring Security & CORS Configuration
* **ORM / Database:** Spring Data JPA, Hibernate, PostgreSQL
* **Build Tool:** Apache Maven

### Frontend
* **Framework:** React.js (Bootstrapped with Vite)
* **HTTP Client:** Axios
* **Routing:** React Router DOM

### Tools & Testing
* **API Testing:** Postman
* **Database Client:** pgAdmin 4 / psql
* **Version Control:** Git & GitHub

---

## 📁 Project Architecture & Directory Structure

```text
ShopStack-Enterprise-Multi-Vendor-E-Commerce-Platform/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/shopstack/backend/
│   │   │   │   ├── config/
│   │   │   │   │   └── SecurityConfig.java      # Spring Security & Permissive CORS Config
│   │   │   │   ├── controller/
│   │   │   │   │   └── AuthController.java      # Authentication REST APIs (/api/auth)
│   │   │   │   ├── model/
│   │   │   │   │   └── User.java                # JPA Entity for User Account & Role Types
│   │   │   │   ├── repository/
│   │   │   │   │   └── UserRepository.java      # JPA Data Repository Interface
│   │   │   │   └── BackendApplication.java      # Main Application Entrypoint
│   │   │   └── resources/
│   │   │       └── application.properties       # DB Credentials & JPA Configurations
│   └── pom.xml
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Register.jsx                     # User Registration UI Component
    │   │   └── Login.jsx                        # User Authentication UI Component
    │   ├── App.jsx                              # Dynamic View State & Navigation Toggle
    │   └── main.jsx                             # React Application Entrypoint
    └── package.json

    🚀 Features Implemented (Day 1 Milestone)
[x] Database Setup: Initialized shopstack_db inside PostgreSQL server.

[x] Spring Boot Core: Initialized backend structure with Spring Data JPA and PostgreSQL database connection driver[cite: 1].

[x] User Entity Data Model: Created User schema containing id, fullName, email, password, and role (CUSTOMER / VENDOR)[cite: 1].

[x] Spring Security Configuration: Custom SecurityFilterChain permitting public CORS access to authentication endpoints (/api/auth/**)[cite: 1].

[x] RESTful API Endpoints:

POST /api/auth/register — Validates non-duplicate emails and registers new accounts[cite: 1].

POST /api/auth/login — Authenticates credentials and returns user details[cite: 1].

[x] React Frontend Setup: Created a Vite-powered React client connected to the backend via axios[cite: 1].

[x] API Testing: Endpoints successfully verified and tested using Postman.

⚙️ How to Run locally
1. Database Configuration
Ensure PostgreSQL is running locally on default port 5432 with a database named shopstack_db.

Update credentials in backend/src/main/resources/application.properties:

Properties
spring.datasource.url=jdbc:postgresql://localhost:5432/shopstack_db
spring.datasource.username=postgres
spring.datasource.password=YOUR_POSTGRES_PASSWORD

2. Running the Backend
Bash
cd backend
mvn clean compile
mvn spring-boot:run
The Spring Boot server will start on port 8080.

3. Running the Frontend
Bash
cd frontend
npm install
npm run dev
The Vite development client will start at http://localhost:5173/.

🧪 Postman Endpoint Testing
Register Endpoint (POST)
URL: http://localhost:8080/api/auth/register

Headers: Content-Type: application/json

Request Body:

JSON
{
  "fullName": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "role": "CUSTOMER"
}
Success Response (200 OK): "User registered successfully!"

2. Login Endpoint (POST)
URL: http://localhost:8080/api/auth/login

Headers: Content-Type: application/json

Request Body:

JSON
{
  "email": "test@example.com",
  "password": "password123"
}
Success Response (200 OK):

JSON
{
  "id": 1,
  "fullName": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "role": "CUSTOMER"
}
Error Response (401 Unauthorized): "Invalid email or password"

# 🛒 ShopStack — Day 2: Customer Module

This repository contains the implementation for **Day 2 (Customer Module)** of the ShopStack E-Commerce platform built with **Spring Boot** and **React (Vite)**.

---

## 📌 Day 2 Deliverables & Features

### 1. Customer Module
- [x] **Customer Registration & Login:** Authentication flow supporting user roles and credentials.
- [x] **Product Browsing:** Live product grid fetching available inventory from PostgreSQL via Spring Boot REST APIs.
- [x] **Product Search:** Case-insensitive search bar filtering items by name or category in real time.
- [x] **Wishlist Management:** Toggleable product wishlist counter integrated into the navigation bar.
- [x] **Cart Management:** Shopping cart drawer with live total calculation, item removal, and persistent state using `localStorage`.
- [x] **Order History:** Automatic cart cleanup upon checkout and persistent order history tracking with unique order IDs (`ORD-XXXXXX`), timestamps, item lists, and order statuses.
- [x] **Profile Management & Address Updates:** Endpoints to view and edit profile details (Full Name, Phone Number, Shipping Address).
- [x] **Flexible Role Switching:** Dynamic option allowing users to toggle freely between **Customer View** and **Vendor View** at any time without losing account data.
- [x] **Premium UI Redesign & Dark/Light Theme Switching:** Transitioned layouts to fluid screens with adaptive CSS variables, interactive Sun/Moon togglers, transitions, and glassmorphic overlays.
- [x] **SVG Vector Icon Integration:** Completely replaced emojis across navigations, forms, buttons, and sidebars with professional `lucide-react` scalable vectors.
- [x] **Dynamically Categorized Product Icons:** Replaced raw character placeholders with visual helper containers centered around headphones, watches, jewelry, gift boxes, and cosmetics icons.
- [x] **Interactive Password Complexity Validation:** Client-side registration validator checklist enforcing 8+ characters, uppercase, lowercase, numbers, and special symbols.

---

## 📂 Project Structure

```text
ShopStack/
├── backend/
│   ├── src/main/java/com/shopstack/backend/
│   │   ├── config/
│   │   │   └── SecurityConfig.java
│   │   ├── controller/
│   │   │   ├── AuthController.java
│   │   │   ├── CustomerController.java
│   │   │   └── ProductController.java
│   │   ├── model/
│   │   │   ├── User.java
│   │   │   └── Product.java
│   │   └── repository/
│   │       ├── UserRepository.java
│   │       └── ProductRepository.java
│   └── pom.xml
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── HomeDashboard.jsx
    │   │   └── CustomerDashboard.jsx
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json

📡 API Endpoints (Day 2)
Authentication & Customer Profile

Method | Endpoint                    | Description
--------------------------------------------------------------------------------
POST   | /api/auth/register          | Register new user account
POST   | /api/auth/login             | User login
GET    | /api/customer/{id}          | Get customer profile details
PUT    | /api/customer/{id},         | Update profile (phone & shipping address)
PUT    | /api/auth/customer/{id}/role| Toggle account role (CUSTOMER ↔ VENDOR)

Products

Method | Endpoint                         | Description
--------------------------------------------------------------------------------
GET    | /api/products                    | Fetch all products (auto-seeds 
       |                                  | inventory if empty)
       |                                  |
GET    |/api/products/search?query={term} | Search products by name or category

🧪 Postman Testing Checklist
Register Customer: POST http://localhost:8080/api/auth/register

Login: POST http://localhost:8080/api/auth/login

Get Profile: GET http://localhost:8080/api/customer/{id}

Update Profile: PUT http://localhost:8080/api/customer/{id}

Switch Role: PUT http://localhost:8080/api/auth/customer/{id}/role with body {"role": "VENDOR"}

Browse Inventory: GET http://localhost:8080/api/products

Search Inventory: GET http://localhost:8080/api/products/search?query=Headphones



# 🏢 ShopStack — Day 3: Multi-Role Dashboards, Collaboration & Product Media

This repository contains the implementation for **Day 3 (Multi-Role Dashboards, Approvals, Fulfillment, Reviews, and Product Media)** of the ShopStack E-Commerce platform built with **Spring Boot** and **React (Vite)**.

---

## 📌 Day 3 Deliverables & Features

### 1. Multi-Role Account Support & Sign-up Protections
- [x] **New Business Roles:** Added support for **Administrator** and **Warehouse Staff** roles alongside existing Customer and Vendor accounts.
- [x] **Email Suffix Validation:** Secure client-side and server-side rules requiring Administrator emails to end with `@admin` and Warehouse Staff emails to end with `@staff`.
- [x] **Unique Vendor ID Generation:** Registration of a new Vendor dynamically generates and shows a permanent, unique 6-digit Vendor ID used for mode switching and secure console entry.

### 2. Merchant/Seller Dashboard (Vendor Mode)
- [x] **Vendor Inventory Management:** Complete CRUD capabilities for merchants to add new listings, update product details (price, stock, category, name, brand, description), and delete products.
- [x] **Product Images & Gallery Manager:** A comprehensive media uploader inside the product form allowing merchants to:
  - Upload local image files directly (converted dynamically into self-contained Base64 Data URLs).
  - Import external web links.
  - Pick quick emojis.
  - Delete thumbnails or click any image to set it as the product's primary cover image.
- [x] **Real-time Analytics Console:** Rich visual widgets displaying total revenue, total orders containing their items, total units sold, average order value, active listing counts, and low-stock warning counts (< 5 units).
- [x] **Merchant Sales Logs:** View dedicated listings of orders containing the vendor's products, specifying order dates, quantities, and pricing.

### 3. Interactive Catalog Gallery & Product Details
- [x] **Interactive Gallery Carousel**: A split layout details modal featuring an image slideshow with left/right arrow controls, a main viewport, and clickable preview thumbnails.
- [x] **Merchant Profile Card**: Dynamic lookup querying the vendor profile details (Store Name, Email, Phone, Location) and displaying them within the product card.

### 4. Product Reviews & Ratings System
- [x] **Real-time Ratings & Comments:** Customers can submit 1 to 5-star product reviews with comments directly from the product details modal.
- [x] **Dynamic Catalog Star Ratings:** Star ratings and review counts are dynamically calculated in the backend and updated in real-time on all store catalog cards. If a product has no reviews, it correctly displays `★ 0.0 (0 reviews)`.
- [x] **Inline Edit and Remove Reviews:** Authorized owners can edit or delete their submitted reviews inline via interactive forms. Security validations on the backend prevent modifying other users' feedback.

### 5. Admin Approvals Workflow Console
- [x] **Listing Moderation:** New product submissions from vendors default to a `PENDING` status and are withheld from the storefront until verified.
- [x] **Approval Actions:** Administrators can view all pending catalog listings and approve or reject submissions in real-time, instantly updating the marketplace storefront.

### 6. Warehouse Fulfillment & Shipping Console
- [x] **Fulfillment Queue:** Warehouse staff can monitor all customer orders placed across the entire platform in a logistics log.
- [x] **Shipment Dispatch Pipeline:** Direct buttons to update order dispatch state from `CONFIRMED` to `SHIPPED` and `DELIVERED`.
- [x] **Catalog Stock Inventory Watch:** Centralized master inventory table showing stock levels with highlighted warning states and visual banners for items running low.

---

## 📂 Project Structure Updates

```text
ShopStack/
├── backend/
│   ├── src/main/java/com/shopstack/backend/
│   │   ├── controller/
│   │   │   ├── VendorController.java       # Vendor analytics, vendor orders and status updates
│   │   │   ├── CustomerController.java     # Added general order management for warehouse staff
│   │   │   └── ProductController.java      # CRUD listings, dynamic ratings, PUT/DELETE reviews
│   │   ├── model/
│   │   │   ├── Review.java                 # JPA Entity for reviews/ratings
│   │   │   ├── Product.java                # Added brand, description, and @ElementCollection images
│   │   │   └── OrderItem.java              # Updated to track vendorId association
│   │   └── repository/
│   │       └── ReviewRepository.java       # Spring Data JPA Repository for reviews
│   
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── AdminDashboard.jsx          # Admin Console for product approvals/rejections
    │   │   ├── WarehouseDashboard.jsx      # Logistical Fulfillment & Shipping Management
    │   │   ├── VendorDashboard.jsx         # Merchant listings CRUD, media uploader, and analytics
    │   │   └── HomeDashboard.jsx           # Browser catalog, gallery carousel, reviews management
```

## 📡 API Endpoints (Day 3)

### Products, Media & Reviews
Method | Endpoint                          | Description
------ | --------------------------------- | -----------
POST   | `/api/products`                   | Submit new vendor product (default: `PENDING`)
PUT    | `/api/products/{id}`              | Update existing product details, brand, and gallery images
DELETE | `/api/products/{id}`              | Remove product listing from catalog
GET    | `/api/products/vendor/{vendorId}` | Fetch all listings submitted by a specific merchant
GET    | `/api/products/pending`           | Admin only: Fetch all pending product submissions
PUT    | `/api/products/{id}/approve`      | Admin only: Set product status to `APPROVED`
PUT    | `/api/products/{id}/reject`       | Admin only: Set product status to `REJECTED`
GET    | `/api/products/{id}/reviews`      | Get list of reviews for a product
POST   | `/api/products/{id}/reviews`      | Add a new customer review (rating 1-5 & comments)
PUT    | `/api/products/reviews/{id}`      | Update existing customer review (owner only)
DELETE | `/api/products/reviews/{id}`      | Delete customer review (owner only)

### Vendor Analytics & Orders
Method | Endpoint                          | Description
------ | --------------------------------- | -----------
GET    | `/api/vendor/{vendorId}/analytics`| Retrieve sales revenue, orders count, AOV, and top-selling list
GET    | `/api/vendor/{vendorId}/orders`   | Retrieve order items linked to this vendor's catalog
PUT    | `/api/vendor/orders/{orderId}/status`| Update order status (`SHIPPED` / `DELIVERED` / `CONFIRMED`)

### Warehouse / Platform Orders
Method | Endpoint                          | Description
------ | --------------------------------- | -----------
GET    | `/api/customer/orders/all`        | Warehouse staff: Retrieve all customer orders in the system

---

## 🧪 Postman & Testing Checklists

### 🔐 1. Role Constraints & Emails
- **Admin Sign Up:** Register with role `ADMINISTRATOR` and email ending in `@admin` (e.g. `owner@admin`). Verify that normal domains or `@staff` fail.
- **Warehouse Sign Up:** Register with role `WAREHOUSE_STAFF` and email ending in `@staff` (e.g. `shipper@staff`).
- **Vendor ID:** Register a `VENDOR`. Verify the modal pops up showing a generated 6-digit ID.

### 🏪 2. Vendor Catalog & Analytics
- **Add Product:** `POST http://localhost:8080/api/products`
  Body: `{"name":"Mechanical Keyboard", "category":"Electronics", "price":1299.00, "stock":15, "vendorId":3}`
- **Retrieve Vendor Sales Log:** `GET http://localhost:8080/api/vendor/3/orders`
- **Retrieve Analytics Widget Info:** `GET http://localhost:8080/api/vendor/3/analytics`

### 🛡️ 3. Admin Verification Queue
- **View Pending Approvals:** `GET http://localhost:8080/api/products/pending` (Should list the "Mechanical Keyboard" with `PENDING` status).
- **Approve Product:** `PUT http://localhost:8080/api/products/{productId}/approve` (Changes status to `APPROVED`).

### 📦 4. Warehouse Shipping Console
- **Fetch Platform Orders:** `GET http://localhost:8080/api/customer/orders/all`
- **Ship Shipment:** `PUT http://localhost:8080/api/vendor/orders/{orderId}/status` with JSON body `{"status": "SHIPPED"}`

### 💬 5. Ratings & Reviews
- **Retrieve Reviews:** `GET http://localhost:8080/api/products/{productId}/reviews`
- **Submit Review:** `POST http://localhost:8080/api/products/{productId}/reviews`
  Body: `{"reviewerName": "Alice Johnson", "rating": 5, "comment": "Excellent build quality!"}`

---

# 🚀 ShopStack — Day 4 & Post-Day 3 Enhancements: Advanced Inventory, Input limits & Checkout Simplification

This section documents the technical enhancements, schema upgrades, API additions, and UI forms introduced in **Day 4 (and enhancements following Day 3)** of the ShopStack E-Commerce platform.

---

## 📌 Day 4 Deliverables & Features

### 1. Multi-Paragraph Product Descriptions (Carriage Return & Newline Support)
- [x] **Paragraph Formatting Preservation**: Integrated custom CSS layout styling rules on the public store catalog details viewport in [HomeDashboard.jsx](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/frontend/src/components/HomeDashboard.jsx#L755) to render descriptions using `whiteSpace: 'pre-wrap'`. This preserves line breaks, enters, and custom paragraph separation inputted by merchants.
- [x] **PostgreSQL TEXT Column Type Mapping**: Configured the ORM mapping in [Product.java](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/backend/src/main/java/com/shopstack/backend/model/Product.java#L32-L33) to assign the `description` column definition type to `TEXT`. This overrides the default character limit, allowing vendors to submit rich descriptions of arbitrary length.

### 2. Expanded Field Sizes & Live Form Validation Counters
- [x] **Extended Product Name & Order Item Capacities**: Updated the database column configurations in [Product.java](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/backend/src/main/java/com/shopstack/backend/model/Product.java#L19-L20) and [OrderItem.java](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/backend/src/main/java/com/shopstack/backend/model/OrderItem.java#L19-L20) to use `@Column(length = 1000)`. This prevents order logging crashes and supports descriptive product names (up to 50 words) without database truncation errors.
- [x] **Live Word Counter UI Widgets**: Refined the product listing wizard form in [VendorDashboard.jsx](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/frontend/src/components/VendorDashboard.jsx#L587-L633) to render dynamic counter indicators (`X / 50 words` for product name, `X / 500 words` for description) that refresh in real time as the vendor types.
- [x] **Interactive Word Limit Warning & Enforcement**: The word counter widget text dynamically highlights in bright red if limits are exceeded. Furthermore, the submit handler strictly blocks request dispatching, throwing interactive toast alerts if validation rules are violated.

### 3. Fee-Free Checkout Simplification
- [x] **Zero GST Tax & Standard Shipping Fees**: Setup clean checkout policies by setting standard `taxRate` and `shippingFee` variables to `0.0` in both storefront components ([HomeDashboard.jsx](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/frontend/src/components/HomeDashboard.jsx#L85) and [CustomerDashboard.jsx](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/frontend/src/components/CustomerDashboard.jsx#L56)).
- [x] **Simplified Checkout Summaries**: Cleaned up checkout summary cards by removing Tax (GST) and Shipping cost rows, showing only the Items Subtotal as the final checkout Total.

### 4. Lightweight Stock Level Management API
- [x] **Quick Inline Stock Updates**: Built a focused stock update API endpoint (`PUT /api/products/{id}/stock`) in [ProductController.java](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/backend/src/main/java/com/shopstack/backend/controller/ProductController.java#L229-L246). This allows vendors in [VendorDashboard.jsx](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/frontend/src/components/VendorDashboard.jsx#L451) and warehouse operators in [WarehouseDashboard.jsx](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/frontend/src/components/WarehouseDashboard.jsx#L46) to increment/decrement inventory count directly. Because it is a separate endpoint, it changes the stock without resetting the product's moderator state back to `PENDING` approval.

### 5. Automated Startup Database Seed Cleanup
- [x] **PostConstruct Seeding Handler**: Configured a `cleanupSeedProducts()` hook in [ProductController.java](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/backend/src/main/java/com/shopstack/backend/controller/ProductController.java#L37-L54) executing on backend startup. It automatically removes raw seeded mock catalog products that lack a VENDOR owner, ensuring a clean, production-ready workspace for live merchant registration.

### 6. Upload Size Configuration Upgrades
- [x] **Increased Spring Boot/Tomcat Upload Limit**: Added capacity rules inside [application.properties](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/backend/src/main/resources/application.properties#L10-L14) to raise multipart/form limits to `50MB`. This accommodates large image payloads uploaded as Base64 Data URL strings.

---

## 📂 Project Structure Updates

The following models, controllers, and properties files house the changes made after Day 3:

```text
ShopStack/
├── backend/
│   ├── src/main/resources/
│   │   └── application.properties       # Increased multipart and tomcat limits to 50MB
│   └── src/main/java/com/shopstack/backend/
│       ├── controller/
│       │   ├── ProductController.java  # Added PUT /api/products/{id}/stock and @PostConstruct seed cleanup
│       │   └── CustomerController.java # Wishlist persistence APIs and Order checkout APIs
│       └── model/
│           ├── Product.java            # Set name capacity to VARCHAR(1000), description to TEXT
│           ├── OrderItem.java          # Set productName capacity to VARCHAR(1000)
│           ├── Order.java              # Database persistence entity for order headers
│           └── WishlistItem.java       # Database persistence entity for customer wishlist links
│
└── frontend/
    └── src/
        └── components/
            ├── HomeDashboard.jsx       # Applied pre-wrap CSS style and zeroed checkout fee constants
            ├── CustomerDashboard.jsx   # Removed GST/shipping UI rows from checkout flow
            ├── VendorDashboard.jsx     # Word count display and validations, plus/minus quick stock adjustments
            └── WarehouseDashboard.jsx  # Warehouse-staff quick inline stock level adjustments
```

---

## 📡 API Endpoints (Day 4 & System Additions)

### Inventory Stock Level & Seeding Controls
Method | Endpoint | Description
------ | -------- | -----------
PUT | `/api/products/{id}/stock` | Quick stock count adjustment (takes `{ "stock": integer }`, keeps status as-is)

### Database-Backed Wishlist Management
Method | Endpoint | Description
------ | -------- | -----------
GET | `/api/customer/{userId}/wishlist` | Fetch database-saved wishlist products for a customer
POST | `/api/customer/{userId}/wishlist/{productId}` | Save a new item to customer's wishlist
DELETE | `/api/customer/{userId}/wishlist/{productId}` | Remove an item from customer's wishlist

### Database-Backed Order History & Checkout
Method | Endpoint | Description
------ | -------- | -----------
GET | `/api/customer/{userId}/orders` | Fetch customer order history logs with itemized lists
POST | `/api/customer/{userId}/orders` | Submit checkout order payload (Zero tax, Zero shipping)

---

## 🧪 Postman & Live UI Testing Checklist

### 1. Description Paragraph Formatting
- **Test Steps**:
  1. Login as a `VENDOR` and open the edit wizard for a product.
  2. In the description, type multiple distinct paragraphs separated by carriage returns (Enter key).
  3. Save the product, make sure it is `APPROVED` by admin, and view it in the `CUSTOMER` storefront catalog details modal.
  - **Expected Result**: Paragraph breaks are fully preserved and displayed correctly.

### 2. Live Word Counter Validation
- **Test Steps**:
  1. Open the **List New Product** form in the Vendor Dashboard.
  2. Paste a product name exceeding 50 words. Check if the counter reads `5X / 50 words` and changes its color to red.
  3. Try saving. The form must reject submission and pop up an error toast: *"Product name cannot exceed 50 words."*
  4. Repeat with a description exceeding 500 words. Assert it blocks saving and displays: *"Product description cannot exceed 500 words."*
  - **Expected Result**: Limits are enforced reactively on the UI and securely validated on save.

### 3. Zero-Fee Checkout Summary
- **Test Steps**:
  1. Log in as a customer, add multiple items to your cart, and click checkout.
  2. Verify the checkout drawer: tax rate is `₹0.00` and shipping is `₹0.00`.
  3. Check the Order History tab: confirm the total order amount matches the subtotal exactly.
  - **Expected Result**: Customers pay only the items' subtotal, without added fees.

### 4. Direct Inventory Stock Management
- **Test Steps**:
  1. In the Vendor or Warehouse dashboard, adjust stock counts directly using the stock control buttons.
  2. Verify that the changes update the database in real-time and reflect on storefront product cards.
  - **Expected Result**: Real-time stock updates are immediately visible to customers.

---

# 🏬 ShopStack — Day 5: Enterprise Multi-Vendor Workflow, Pricing & Discounts, Multiple Addresses, Selective Checkout & Razorpay Payment Gateway

This section documents the comprehensive enterprise features implemented in **Day 5** of the ShopStack Multi-Vendor E-Commerce platform, adhering to the Springboard Mentor Workflow requirements, multiple shipping destinations architecture, tiered delivery charge engine, cart item selective checkout, password recovery security, and official **Razorpay Payment Gateway integration**.

---

## 📌 Day 5 Deliverables & Architecture Overview

```text
Vendor Login
      │
      ▼
Add / Update Product (Price & Discount %)
      │
      ▼
System Calculates Final Price & Sets Status to PENDING
      │
      ▼
Admin Reviews Product Specifications & Merchant Identity
      │
      ▼
Admin Approves / Rejects Listing
      │
      ▼
Customer Views Approved Product Catalog with Discount Badges
      │
      ▼
Customer Adds Items to Cart & Selects Specific Items
      │
      ▼
Dynamic Calculation of Items Subtotal, Tiered Delivery & Total Savings
      │
      ▼
Checkout with Saved Default / Custom Shipping Address
      │
      ▼
Payment Method Selection: Razorpay Online Gateway or Cash on Delivery (COD)
      │
      ├───────────────────────────────┬───────────────────────────────┐
      ▼                                                               ▼
[Razorpay Secure Checkout]                                     [Cash on Delivery]
• Create Razorpay Server Order (/api/payment/create-order)     • Direct order placement
• Open Razorpay Popup (UPI, Cards, NetBanking, Wallets)        • Payment Method = COD
• Customer Completes Transaction in Sandbox                    • Status = CONFIRMED
• Verify HMAC-SHA256 Signature (/api/payment/verify-and-order)
      │                                                               │
      └───────────────────────────────┬───────────────────────────────┘
                                      ▼
             Order Record Created, Inventory Stock Deducted,
             Purchased Items Cleared & Order Receipt Displayed
```

---

## 🚀 Key Features Implemented (Day 5 Milestone)

### 1. Official Razorpay Payment Gateway Integration
- [x] **Razorpay Java SDK**: Integrated official `com.razorpay:razorpay-java:1.4.8` SDK into the Spring Boot backend with configurable properties (`razorpay.key.id`, `razorpay.key.secret`, `razorpay.currency=INR`).
- [x] **Spring Bean Lifecycle (`RazorpayConfig.java`)**: Configured Spring Boot `@Bean` for `RazorpayClient` to manage payment gateway sessions.
- [x] **Server-Side Razorpay Order Generation (`POST /api/payment/create-order`)**:
  - Dynamically calculates the exact order amount in Indian Rupees.
  - Converts to paise (1 INR = 100 paise) and securely creates an authorized order on Razorpay servers.
  - Returns `razorpayOrderId`, `amount`, `currency`, and public `keyId` to the client.
- [x] **Cryptographic HMAC-SHA256 Signature Verification (`POST /api/payment/verify-and-order`)**:
  - Validates `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature` using server-side HMAC-SHA256 hash calculation against `razorpay.key.secret`.
  - Blocks any forged, manipulated, or unverified transactions with a 400 Bad Request error.
- [x] **Transactional Inventory & Order Placement (`PaymentService.java`)**:
  - Verifies live product stock before finalizing orders.
  - Automatically decrements stock from the PostgreSQL `products` table upon successful payment.
  - Generates platform order reference (`ORD-XXXXXX`), timestamps, payment method (`RAZORPAY` or `COD`), transaction reference IDs, and customer delivery info.
- [x] **Frontend Razorpay Checkout SDK Integration**:
  - Injected official Razorpay Checkout SDK (`https://checkout.razorpay.com/v1/checkout.js`) in `index.html` and dynamic runtime loader.
  - Launches Razorpay's native popup modal supporting **UPI (Google Pay, PhonePe, Paytm)**, **Credit/Debit Cards (Visa, Mastercard, RuPay)**, **Net Banking (All Indian Banks)**, and **Wallets**.
- [x] **Streamlined Payment UI**:
  - Clean, modern payment selection supporting **Razorpay Online Checkout** and **Cash on Delivery (COD)** with instant visual feedback and security badges.

### 2. Dynamic Pricing, Discounts & Automated Calculations
- [x] **Vendor Discount Application**: Vendors can define a **Regular Price** (`price`) and an optional **Discount Percentage** (`discountPercentage`, 0% to 100%) when listing or editing products.
- [x] **Automated Final Price Engine**: Backend entity (`Product.java`) computes the final price using `@PrePersist` and `@PreUpdate` JPA lifecycle hooks:
  $$\text{Final Price} = \text{Price} \times \left(1 - \frac{\text{Discount \%}}{100}\right)$$
- [x] **Real-Time Savings & Badges**: Storefront catalog, cart drawers, and product modal displays regular strikethrough MRP, gradient discount badges (`{X}% OFF`), and final discounted prices.

### 3. Product Approval & Administrative Workflow Console
- [x] **Moderation Status Enforcement**: Whenever a vendor creates a product or updates pricing/discounts, the product status is automatically placed in **`PENDING`** approval.
- [x] **Admin Approval Console**: Dedicated interactive console in [AdminDashboard.jsx](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/frontend/src/components/AdminDashboard.jsx) with real-time pending notification badges.
- [x] **Merchant Identity Verification**: Admin console displays full merchant details for each submission:
  - **Vendor Full Name**
  - **Vendor ID & Unique 6-Digit Vendor Code** (`VND-XXXXXX`)
  - **Contact Email & Phone Number**
  - **Registered Business Address**
- [x] **Approval & Rejection Actions**: Administrators can one-click **Approve** (`APPROVED`) products into the public store or **Reject** (`REJECTED`) with mandatory administrative feedback reasons.

### 4. Tiered Delivery Charges & Total Savings Engine
- [x] **Delivery Fee Rules**:
  - Orders **under ₹500**: Flat delivery fee of **₹99**.
  - Orders **₹500 or above**: **FREE Delivery** (Delivery fee = ₹0).
- [x] **Total Savings Display**: Replaced basic notifications with a high-visibility **`💰 Total Savings: ₹{totalSavings}`** banner, dynamically summing:
  $$\text{Total Savings} = \text{Product Discounts} + \text{Free Delivery Savings (₹99)}$$
- [x] **Free Delivery Upsell Indicator**: Real-time progress callout (`🚚 Add ₹X more for FREE Delivery!`) when order subtotal is below ₹500.

### 5. Multiple Shipping Addresses Management ("Your Addresses")
- [x] **Database Address Entity**: Created [Address.java](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/backend/src/main/java/com/shopstack/backend/model/Address.java) and [AddressRepository.java](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/backend/src/main/java/com/shopstack/backend/repository/AddressRepository.java) supporting `HOME`, `WORK`, and `OTHER` address types.
- [x] **Dedicated "Your Addresses" Tab**: New sidebar view in Customer Profile displaying all saved addresses with a prominent emerald **`✓ DEFAULT ADDRESS`** badge.
- [x] **Address Controls**:
  - **Set as Default**: One-click default address switcher (`PUT /api/customer/{id}/addresses/{addressId}/default`).
  - **Edit & Delete**: Modal editing and safe deletion with fallback default promotion.
  - **Add Address Modal**: Clean form with recipient name, phone, street, city, state, and postal code.
- [x] **Decoupled User Profile**: Removed legacy static address input from the main profile overview card.
- [x] **Streamlined Checkout Address Picker**: 1-click address selector chips in Step 1 of checkout with collapsible custom manual entry.

### 6. Selective Cart Item Checkout ("Select All" & Item Checkboxes)
- [x] **"Select All" Master Checkbox**: Instant toggle bar in Cart Drawer and Customer Cart Tab to select or deselect all cart items at once.
- [x] **Item-Level Selection**: Each cart item features a checkbox allowing customers to select specific items for purchase.
- [x] **Dynamic Selective Pricing**: Cart subtotal, discounts, delivery charges, and final amounts calculate strictly based on the **selected items**.
- [x] **Selective Order Execution**: Checkout only places orders for selected items. Unselected items remain safely in the customer's cart for future checkout.

### 7. Password Recovery & Security Enhancements
- [x] **Forgot Password Verification**: Endpoints in [AuthController.java](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/backend/src/main/java/com/shopstack/backend/controller/AuthController.java) verifying account existence before allowing password reset.
- [x] **Dynamic Password Strength Checklist**: Real-time complexity validator enforcing 8+ characters, uppercase, lowercase, numbers, and symbols during password reset.
- [x] **Password Confirmation Match**: Client-side match validation preventing mismatched passwords.

---

## 📂 Project Structure Updates (Day 5)

```text
ShopStack/
├── backend/
│   ├── pom.xml                                  # Added com.razorpay:razorpay-java:1.4.8 & org.json
│   └── src/main/
│       ├── resources/
│       │   └── application.properties           # Added razorpay.key.id, razorpay.key.secret, razorpay.currency
│       └── java/com/shopstack/backend/
│           ├── config/
│           │   ├── RazorpayConfig.java          # Spring Bean provider for RazorpayClient
│           │   └── SecurityConfig.java          # Permitted /api/payment/** public endpoints
│           ├── controller/
│           │   ├── AuthController.java          # Forgot & reset password services
│           │   ├── CustomerController.java      # Address CRUD (/api/customer/{id}/addresses/**)
│           │   ├── PaymentController.java       # Razorpay order generation & signature verification APIs
│           │   └── ProductController.java       # Discount calculations, approval moderation & vendor hydration
│           ├── service/
│           │   └── PaymentService.java          # Razorpay order creation, HMAC-SHA256 verification & checkout transactions
│           ├── model/
│           │   ├── Address.java                 # Database entity for multiple customer addresses
│           │   ├── Order.java                   # Added razorpayOrderId, razorpayPaymentId, paymentMethod & shipping info
│           │   ├── OrderItem.java               # Line item pricing, discount % and vendor ID mapping
│           │   ├── Product.java                 # Discount %, final price calculation & transient vendor details
│           │   └── User.java                    # Vendor codes & role mappings
│           └── repository/
│               ├── AddressRepository.java       # JPA repository for shipping addresses
│               ├── OrderRepository.java         # JPA repository for customer orders
│               ├── OrderItemRepository.java     # JPA repository for order items
│               └── ProductRepository.java       # JPA repository for products
│
└── frontend/
    ├── index.html                               # Injected https://checkout.razorpay.com/v1/checkout.js
    └── src/
        └── components/
            ├── AdminDashboard.jsx               # Product Approval Workflow Console & Merchant details view
            ├── CustomerDashboard.jsx            # "Your Addresses" tab, selective cart checkout & Razorpay checkout integration
            ├── HomeDashboard.jsx                # Selective cart checkout, tiered delivery charges, savings banner & Razorpay checkout
            ├── VendorDashboard.jsx              # Product discount setting, final price preview & pending state
            └── Login.jsx                        # Forgot password modal with password complexity validator
```

---

## 📡 API Endpoints (Day 5)

### Razorpay Payment Gateway & Checkout
Method | Endpoint | Description
------ | -------- | -----------
GET | `/api/payment/config` | Public endpoint returning Razorpay public key ID and default currency (`INR`)
POST | `/api/payment/create-order` | Generates a server-side order on Razorpay with amount in paise (takes `{ "amount": number, "receipt": string }`)
POST | `/api/payment/verify-and-order` | Verifies cryptographic HMAC-SHA256 signature, validates stock, reduces inventory, and saves confirmed order

### Product Pricing & Moderation Workflow
Method | Endpoint | Description
------ | -------- | -----------
GET | `/api/products/pending` | Fetch all product listings awaiting Admin approval (with full vendor details)
PUT | `/api/products/{id}/approve` | Approve product listing and publish it to the live marketplace
PUT | `/api/products/{id}/reject` | Reject product listing with an administrative reason

### Customer Multiple Shipping Addresses
Method | Endpoint | Description
------ | -------- | -----------
GET | `/api/customer/{userId}/addresses` | Fetch all saved shipping addresses for a customer (default first)
POST | `/api/customer/{userId}/addresses` | Save a new shipping address
PUT | `/api/customer/{userId}/addresses/{addressId}` | Update an existing shipping address
PUT | `/api/customer/{userId}/addresses/{addressId}/default` | Set an address as the default delivery destination
DELETE | `/api/customer/{userId}/addresses/{addressId}` | Delete a shipping address

### Password Recovery Services
Method | Endpoint | Description
------ | -------- | -----------
POST | `/api/auth/forgot-password` | Verify registered email address and initiate password recovery
POST | `/api/auth/reset-password` | Update and save the verified new password

---

## 🧪 Testing Checklist & Verification Guide

### 1. Razorpay Payment Gateway Flow (Sandbox Testing)
1. Add items to the cart and proceed to Checkout.
2. Select **Razorpay Checkout (UPI, Cards, NetBanking, Wallets)**.
3. Click **"Pay ₹X with Razorpay"**:
   - The official Razorpay Test Checkout modal opens.
   - Test Card: `4111 1111 1111 1111`, any future expiry date (e.g. `12/28`), CVV: `123`, OTP: `123456`.
   - Test UPI: enter any valid VPA (e.g. `success@razorpay`).
4. Upon payment success, backend cryptographically verifies the signature (`HMAC-SHA256`) and confirms the order.
5. The UI displays the **Order Confirmed** screen with the unique order ID and payment reference.
6. The product stock is automatically decremented in the inventory database.

### 2. Cash on Delivery (COD) Flow
1. Select **Cash on Delivery (COD)** in the checkout modal.
2. Click **"Confirm Cash on Delivery Order"**.
3. Order is immediately confirmed with payment method recorded as `COD`.

### 3. End-to-End Vendor Pricing & Admin Approval
1. Log in as a **Vendor** (`role: VENDOR`).
2. Add a new product with Regular Price = `₹2,499` and Discount = `8%`.
3. Verify that the dashboard calculates the Final Price as `₹2,299.08` and flags the product as **`PENDING APPROVAL`**.
4. Log in as an **Administrator** (`role: ADMINISTRATOR`) and navigate to the **Product Approval Console**.
5. Confirm that the table displays the product along with the **Vendor Name, ID, Vendor Code, Email, and Phone**.
6. Click **Approve**.
7. Switch to **Customer Mode** and verify the product is visible in the marketplace catalog with the `8% OFF` badge.

### 4. Tiered Delivery Charges & Total Savings
1. Add items totaling under `₹500` to the cart.
2. Verify that Delivery Charges show **`₹99`** and the callout reads *"Add ₹X more for FREE Delivery!"*.
3. Add items to exceed `₹500`.
4. Verify that Delivery Charges switch to **`FREE`** and the green banner displays **`💰 Total Savings: ₹{totalSavings}`**.

### 5. Multiple Addresses ("Your Addresses")
1. In the Customer Profile, click **`Your Addresses`**.
2. Add a `HOME` address and a `WORK` address.
3. Click **Set as Default** on the `WORK` address and verify the emerald **`✓ DEFAULT ADDRESS`** badge updates.
4. Proceed to Checkout and verify the `WORK` address is selected by default in the compact selector.

### 6. Selective Cart Item Checkout
1. Add 3 distinct products to your cart.
2. In the Cart Drawer, uncheck 1 item.
3. Verify that the price subtotal and total savings dynamically recalculate for the 2 selected items only.
4. Complete checkout payment.
5. Verify that the 2 purchased items are removed from the cart, while the unselected item remains safely in your cart.

### 7. Password Recovery & Strength Enforcement
1. Go to the login screen and click **"Forgot Password?"**.
2. Enter a registered email and click "Next".
3. In the new password field, type a weak password (e.g. `abc`). Check that strength requirements are highlighted in red/grey.
4. Type a strong password (`Password123!`). Assert all checklist items turn green.
5. Verify password confirmation matching before reset completes successfully.

---

# 📦 ShopStack — Day 6: Image Disk Storage, In-App Slideshow Lightbox, Out-of-Stock Cart Controls & Instant Inventory Management

This repository contains the implementation for **Day 6** of the ShopStack Enterprise E-Commerce Platform.

---

## 📌 Day 6 Deliverables & Major Enhancements

### 1. Product Images Server Disk Storage & Base64 Migration
- [x] **File Storage Service (`FileStorageService.java`):** Saved uploaded product images to server filesystem (`backend/uploads/products/`) with unique UUID-based filenames rather than storing heavy Base64 strings in PostgreSQL, permanently resolving the PostgreSQL row-size bloat and 5MB payload limit.
- [x] **Static Resource Handler (`WebConfig.java`):** Configured Spring `WebMvcConfigurer` to serve `/uploads/**` statically over HTTP (`http://localhost:8080/uploads/...`).
- [x] **Spring Security Public Access:** Allowed unauthenticated static access to `/uploads/**` in `SecurityConfig.java`.
- [x] **Single & Batch Multipart Upload Endpoints:** Added `POST /api/products/upload-image` and `POST /api/products/upload-images` with `multipart/form-data` support.
- [x] **Automated Base64 Migration on Startup:** `initProducts()` automatically scans existing products on server boot, converts legacy Base64 images to physical disk files, and updates the database with lightweight URL paths.
- [x] **Hibernate LazyInitializationException Resolution:** Configured `fetch = FetchType.EAGER` on `Product.images` and added `@Transactional` to `initProducts()`.

### 2. Automated Image File Deletion & Disk Storage Cleanup
- [x] **Instant Single Image Deletion (`DELETE /api/products/delete-image`):** Added a dedicated endpoint and connected the red **`×`** button in the product edit modal so clicking it immediately sends an API request to delete the physical image file from the `uploads/products/` folder.
- [x] **Automated Cleanup on Product Update (`PUT /api/products/{id}`):** When a vendor updates a product, the backend automatically compares the existing image list with the updated images and deletes any removed images from disk storage.
- [x] **Automated Cleanup on Product Deletion (`DELETE /api/products/{id}`):** When a product is removed by a vendor, the system automatically deletes its cover image and all gallery images stored on disk to avoid orphaned files.
- [x] **Path Traversal Security Protection:** Built strict path sanitization into `FileStorageService.deleteFile(...)` verifying that target paths resolve safely within the designated upload directory.

### 3. Gallery UI & No-Page-Scroll Thumbnail Slider
- [x] **Contained Horizontal Overflow:** Added strict `overflow-x: hidden` and `min-width: 0` constraints to modals and flex layouts to eliminate unwanted bottom scrollbars across the page and modals.
- [x] **Dedicated Thumbnail Carousel Track:** Created `.thumbnail-slider-container` with smooth `‹` / `›` track scroll buttons so thumbnail galleries scroll seamlessly inside their container without shifting layout.

### 4. In-App Fullscreen Gallery Slideshow / Lightbox
- [x] **In-App Slideshow Lightbox:** Clicking product images opens an interactive fullscreen slideshow overlay with a blurred backdrop without navigating away or opening external browser tabs.
- [x] **Smooth Previous / Next Navigation:** Floating navigation buttons (`‹` / `›`) allow users to cycle through all product images one by one.
- [x] **Keyboard Controls:** Full keyboard support with **`←` (Left Arrow)** for previous image, **`→` (Right Arrow)** for next image, and **`Esc`** to close the gallery.
- [x] **Active Position Counter & Bottom Strip:** Displays current slide status (`Image X of Y`) and a bottom interactive thumbnail strip for fast jumps.

### 5. Out-of-Stock Display in Cart & Checkout Prevention
- [x] **Live Real-time Stock Sync:** Cart evaluates items against current live product inventory from the database.
- [x] **Prominent Out-of-Stock Badges:** Items with 0 inventory display a high-visibility **`🚫 OUT OF STOCK`** badge with dimmed styling.
- [x] **Automatic Selection Filtering:** Checkboxes for out-of-stock items are disabled and excluded from checkout selection.
- [x] **Select All In-Stock:** "Select All" toggle only selects items that are currently in stock.
- [x] **Checkout Guard:** "Proceed to Checkout" button is disabled if any out-of-stock item is selected, and `handleStartCheckout` along with `PaymentService.placeVerifiedOrder` validate inventory on both client and server sides to prevent overselling.

### 6. Dedicated Vendor Stock Management (Decoupled from Admin Approval)
- [x] **Decoupled Stock Updates:** Removed the stock input from the "Edit Product Details" modal so vendors don't trigger Admin re-approval when adjusting inventory quantities.
- [x] **Dedicated Stock Endpoint:** Added `PUT /api/products/{id}/stock` to directly update product inventory in the database while retaining its active `APPROVED` status.
- [x] **Quick Stock Management Modal:** Added a dedicated **"Stock"** action button in the vendor product table that opens a fast inventory modal with direct inputs and presets (`Set 0 / Out of Stock`, `+10`, `+50`, `+100`).
- [x] **Inline Quick Step Buttons:** Quick `+` and `-` buttons in the vendor product table for one-click adjustments.

---

## 📂 Project Structure Updates (Day 6)

```text
ShopStack/
├── backend/
│   ├── uploads/
│   │   └── products/                            # Server disk directory for uploaded product images
│   └── src/main/
│       ├── resources/
│       │   └── application.properties           # Added app.upload.dir and app.backend.base-url
│       └── java/com/shopstack/backend/
│           ├── config/
│           │   ├── SecurityConfig.java          # Added /uploads/** to permitAll()
│           │   └── WebConfig.java               # Static resource mapping for /uploads/** -> filesystem
│           ├── controller/
│           │   └── ProductController.java       # Added upload/delete-image endpoints & dedicated PUT /api/products/{id}/stock
│           ├── service/
│           │   ├── FileStorageService.java      # Multipart/Base64 disk storage & safe file deletion
│           │   └── PaymentService.java          # Server-side stock verification
│           └── model/
│               └── Product.java                 # fetch = FetchType.EAGER on images collection
│
└── frontend/
    └── src/
        ├── index.css                            # Overflow prevention, thumbnail slider & Lightbox styles
        └── components/
            ├── HomeDashboard.jsx                # In-app Lightbox slideshow, out-of-stock cart badges & checkout block
            ├── CustomerDashboard.jsx            # Out-of-stock cart badges, auto-unselect & checkout guard
            └── VendorDashboard.jsx              # FormData uploads, instant file deletion & dedicated "Manage Stock" modal
```

---

## 📡 API Endpoints (Day 6)

### Product Image Storage, Uploads & Deletions
Method | Endpoint | Description
------ | -------- | -----------
POST | `/api/products/upload-image` | Upload a single multipart image file to server disk (`uploads/products/`) and return accessible HTTP URL
POST | `/api/products/upload-images` | Batch upload multiple multipart image files and return array of URLs
DELETE | `/api/products/delete-image?imageUrl={url}` | Delete a specific image file from server disk storage
GET | `/uploads/products/{fileName}` | Public static file serving for saved product images

### Dedicated Inventory & Stock Management
Method | Endpoint | Description
------ | -------- | -----------
PUT | `/api/products/{id}/stock` | Directly updates product stock quantity without changing approval status to `PENDING`

---

## 🧪 Testing Checklist & Verification Guide (Day 6)

### 1. Product Image Upload & Automatic Deletion from Disk
1. Log in as a **Vendor**.
2. Click **"+ Add Product"** or edit an existing product and upload images.
3. Verify files appear in `backend/uploads/products/`.
4. Click the red **`×`** button on an uploaded image thumbnail:
   - Verify the thumbnail disappears from the modal.
   - Verify the physical file is immediately removed from the `backend/uploads/products/` folder on disk.
5. Save or update the product with fewer images and confirm unreferenced files are deleted from the disk folder.
6. Delete a product and verify all of its stored images are automatically removed from disk.

### 2. In-App Fullscreen Gallery Slideshow (Lightbox)
1. Open any product details modal on the Home dashboard.
2. Click the product image or click **"View Gallery"**.
3. Verify that the in-app lightbox opens smoothly without opening a new browser tab.
4. Click the **`‹` / `›`** arrows or press **`←` / `→`** arrow keys on your keyboard to slide through photos.
5. Press **`Esc`** or click the close button to return to the product details.

### 3. Out-of-Stock Cart Controls
1. Set a product's stock to `0` in the vendor dashboard.
2. View the product in the shopping cart:
   - Verify the red **`🚫 OUT OF STOCK`** badge is displayed.
   - Verify the selection checkbox is disabled.
   - Verify the quantity increase (`+`) button is disabled.
3. Verify the **"Proceed to Checkout"** button is disabled with warning text when out-of-stock items are selected.
4. Uncheck or remove the out-of-stock item and verify checkout becomes enabled for remaining in-stock items.

### 4. Instant Vendor Stock Management (No Admin Approval Required)
1. Log in as a **Vendor** and go to **Products**.
2. Click the **"Stock"** button next to any approved product.
3. Use the modal to change the stock (e.g. click `+50` or set a new number) and click **"Save Stock (Instant Update)"**.
4. Verify the stock is updated immediately in the catalog without the product status changing to `PENDING APPROVAL`.

---

# 📦 ShopStack — Day 7: Automated Inventory Restocking on Returns/Refunds, End-to-End Return Lifecycle Governance, Warehouse Operations & Marketplace Settlement Engine

This milestone establishes automated inventory restocking upon returns and refunds, an enterprise return governance workflow, a dedicated warehouse operations dashboard, and automated vendor payout settlement calculations.

---

## 📌 Day 7 Deliverables & Major Enhancements

### 1. Automated Stock Replenishment on Return & Refund
- [x] **Restock on Return Approval & Refund Execution (`approveAndExecuteRefund`):** When an Administrator or Warehouse Officer approves a customer return after physical quality inspection and disburses the refund, the backend automatically retrieves all line items for that order and increases the product stock inventory (`currentStock + item.getQuantity()`).
- [x] **Restock on Direct Admin Override Refund (`processRefund`):** When an Admin issues an immediate direct refund for an order, the system automatically replenishes the respective products' inventory.
- [x] **Restock on Order Status Cancellation & Refund (`VendorController.updateOrderStatus`):** When an order's status transitions to `CANCELLED` or `REFUNDED` through the vendor or warehouse operations portal, line item stock quantities are automatically restored to active inventory.
- [x] **Safe Product Line Item Resolution:** Implemented `restockOrderItems(String orderId)` in `PaymentService.java` which iterates across `OrderItemRepository` entries, fetches each referenced `Product` by ID, increments available stock, and safely saves updates to PostgreSQL.

### 2. Enterprise End-to-End Return & Refund Lifecycle Governance
- [x] **Multi-Stage Return Pipeline:** Structured complete lifecycle tracking across stages:
  - `REQUESTED` — Customer initiates return request specifying reason category and notes.
  - `ITEM_RETURNED` — Physical package arrives at warehouse.
  - `QC_PASSED` / `QC_FAILED` — Warehouse inspection validates product authenticity and condition.
  - `REFUNDED` / `REJECTED` — Final administrative decision and disbursement.
- [x] **Categorized Return Reasons:** Support for standardized return reasons:
  - `DEFECTIVE_DAMAGED` (Defective / Damaged Item)
  - `WRONG_ITEM` (Wrong Item Delivered)
  - `SIZE_FIT_ISSUE` (Size or Fit Issue)
  - `CHANGED_MIND` (Changed Mind / No Longer Needed)
  - `NOT_AS_DESCRIBED` (Product Does Not Match Listing)
- [x] **Flexible Resolution Types:** Supports `REFUND`, `REPLACEMENT`, and `EXCHANGE` tracking.
- [x] **Integrated Razorpay Refund API:** Executes real-time refund requests against Razorpay API in Test Mode (`razorpayClient.payments.refund(...)`) with test-mode mock fallback and auto-generated transaction references (`rfnd_test_*` / `rfnd_offline_*`).
- [x] **Partial & Full Refund Tracking:** Automatic balance calculations ensuring refund disbursements do not exceed the remaining refundable order amount.

### 3. Warehouse Operations & Fulfillment Console (`WarehouseDashboard.jsx`)
- [x] **Dispatch & Fulfillment Queue:** Warehouse staff can monitor all confirmed marketplace orders and transition status across `CONFIRMED` → `SHIPPED` → `DELIVERED`.
- [x] **Returns Quality Inspection Hub:** Dedicated view for reviewing customer return reasons, verifying items, and signaling QC inspection status for administrative clearance.
- [x] **Live Warehouse Stock Auditing:** Interactive inventory table allowing warehouse personnel to audit and make direct stock count adjustments.

### 4. Marketplace Commission Ledger & Vendor Settlement Engine
- [x] **Platform Commission Automation (`shopstack.commission.percentage=10.0`):** Configurable marketplace commission deducted automatically from vendor gross sales.
- [x] **Settlement Entity & Ledger (`Settlement.java`, `SettlementRepository.java`):** Persists vendor payouts tracking `grossAmount`, `commissionPercentage`, `commissionAmount`, `netPayoutAmount`, and settlement status (`PENDING` / `SETTLED`).
- [x] **Admin Payout Management Console (`AdminController.java`):** Overview of total platform gross volume, total commission revenue, pending vendor payouts, settled amounts, and one-click payout clearance (`PUT /api/admin/settlements/{id}/mark-settled`).
- [x] **Vendor Settlement History:** Dedicated ledger in Vendor Dashboard showing individual order payouts, commission fees, and net earnings.

### 5. Payment Health Monitoring & Metrics Dashboard
- [x] **Live Metrics Overview (`GET /api/admin/payment-monitoring`):** Real-time aggregation of total orders, paid count, pending count, failed/cancelled count, refunded count, and total paid transaction volume.
- [x] **Transaction Audit Trail (`GET /api/payment/transactions`):** Multi-filter transaction search by user ID, vendor ID, order status, and payment status.

---

## 📂 Project Structure Updates (Day 7)

```text
ShopStack/
├── backend/
│   └── src/main/java/com/shopstack/backend/
│       ├── model/
│       │   ├── Refund.java                      # Return & Refund entity with returnStage, resolutionType, reasonCategory
│       │   ├── Settlement.java                  # Vendor settlement ledger model with commission & net payout
│       │   └── OrderItem.java                   # Order line items with productId & quantity mapping
│       ├── repository/
│       │   ├── RefundRepository.java            # JPA repository for refund records
│       │   └── SettlementRepository.java        # JPA repository for vendor settlements
│       ├── controller/
│       │   ├── AdminController.java             # Admin returns review, approval/rejection & settlement payouts
│       │   ├── PaymentController.java           # Payment verification, return requests & transaction logs
│       │   └── VendorController.java            # Order status updates with automated stock replenishment
│       └── service/
│           └── PaymentService.java              # restockOrderItems(), approveAndExecuteRefund() & processRefund()
│
└── frontend/
    └── src/
        └── components/
            ├── AdminDashboard.jsx               # Returns & Refunds Tab, Settlement Ledger & Payment Monitoring
            ├── WarehouseDashboard.jsx           # Order Dispatch, Returns Inspection & Stock Management
            ├── CustomerDashboard.jsx            # Return Request Submission & Refund Status Tracking
            └── VendorDashboard.jsx              # Vendor Settlement Earnings & Order Fulfillment
```

---

## 📡 API Endpoints (Day 7)

### Returns & Refunds Lifecycle
Method | Endpoint | Description
------ | -------- | -----------
POST | `/api/payment/refund/request` | Customer submits a return & refund request with reason category and notes
GET | `/api/payment/refund/{orderId}` | Fetch return & refund history for a specific order
GET | `/api/admin/refunds` | Admin/Warehouse retrieves all marketplace return requests with optional status filter
POST | `/api/admin/refunds/{refundId}/approve` | Admin approves return after QC inspection, disburses refund & **automatically restocks product inventory**
POST | `/api/admin/refunds/{refundId}/reject` | Admin rejects return request with specific rejection reason notes
POST | `/api/payment/refund` | Admin direct override refund execution & **automatic product restocking**

### Vendor Settlement & Payout Engine
Method | Endpoint | Description
------ | -------- | -----------
GET | `/api/admin/settlements` | Retrieve platform-wide settlement summary (gross, commission, net payout) and list
PUT | `/api/admin/settlements/{id}/mark-settled` | Mark a vendor payout as `SETTLED` with timestamp
GET | `/api/vendor/{vendorId}/settlements` | Retrieve settlement ledger for a specific vendor

### Payment Health & Monitoring
Method | Endpoint | Description
------ | -------- | -----------
GET | `/api/admin/payment-monitoring` | Overview metrics for paid, pending, failed, refunded orders and total volume
GET | `/api/payment/transactions` | Filterable transaction audit records
GET | `/api/payment/status/{orderId}` | Live payment and fulfillment status for an order

---

## 🧪 Testing Checklist & Verification Guide (Day 7)

### 1. Automatic Inventory Restocking on Return & Refund Approval
1. Note the current stock of a product (e.g. `Stock: 10`).
2. Place an order for **2 units** of this product as a customer.
3. Verify that product stock decreases to **`8`**.
4. As the customer, go to **Order History** and click **"Request Return / Refund"** on the order.
5. Select a return reason (e.g. *Defective / Damaged*) and submit.
6. Log in as an **Administrator** and navigate to the **Returns & Refunds** tab.
7. Click **"Approve & Disburse Refund"** on the pending request.
8. Verify that the return status changes to **`REFUNDED`** and **`QC Passed`**.
9. Check the product stock in the catalog or vendor dashboard:
   - ✅ **Assert product stock has automatically increased back by 2 units (from `8` to `10`)**.

### 2. Automatic Restocking on Direct Admin Refund
1. Place an order for a product.
2. In the Admin Dashboard, click **"Direct Refund"** on the order and enter the refund amount.
3. Confirm the refund.
4. ✅ **Assert that product inventory is immediately restored by the purchased quantity**.

### 3. Automatic Restocking on Order Cancellation
1. Place an order for a product.
2. In the Vendor or Warehouse dashboard, change the order status to **`CANCELLED`**.
3. ✅ **Assert that product stock is automatically restored in the database**.

### 4. Warehouse Returns Inspection & Dispatch Flow
1. Log in as **Warehouse Staff**.
2. Go to **Dispatch Management** and update an order from `CONFIRMED` to `SHIPPED` and `DELIVERED`.
3. Switch to the **Returns & Quality Inspection** tab to review submitted customer return claims.
4. Verify warehouse staff can review item condition and customer-reported notes.

### 5. Vendor Settlement & Commission Payout Ledger
1. Log in as an **Administrator** and navigate to **Vendor Settlements**.
2. Verify total gross, platform commission (10%), and net vendor payout calculations match order totals.
3. Click **"Mark Settled"** on a pending settlement.
4. Verify status updates to emerald **`SETTLED`** with settlement timestamp recorded.
5. Log in as the respective **Vendor** and verify the payout appears in their settlement history ledger.

---

## 📡 API Endpoints (Day 8: Admin Dashboard & Reporting Modules)

### Marketplace Analytics & Vendor Management
Method | Endpoint | Description
------ | -------- | -----------
GET | `/api/admin/dashboard-summary` | Aggregates gross marketplace volume, commission fees, net payouts, orders, products count, low stock items, category distribution, and recent orders.
GET | `/api/admin/vendors` | Returns all registered vendor profiles with products counts, gross sales, commission contributed, net payouts, and operational code details.

### System Diagnostics & Service Telemetry
Method | Endpoint | Description
------ | -------- | -----------
GET | `/api/admin/system-status` | Compiles live JVM memory details (used/max), available CPUs, API uptime, database tables rows (users, products, orders, settlements, refunds), local disk storage files count/size, and Razorpay configuration check.

### Business Intelligence Reports
Method | Endpoint | Description
------ | -------- | -----------
GET | `/api/admin/reports/generate` | Generates structured JSON reports for Sales, Merchants, Inventory, and Refunds filtered by type.
GET | `/api/admin/reports/export` | Generates and streams formatted CSV files directly as HTTP file download attachments.

---

## 🧪 Testing Checklist & Verification Guide (Day 8)

### 1. Marketplace Analytics
1. Log in as an **Administrator** (using an email ending in `@admin`).
2. Verify redirection to the newly designed Admin Dashboard console.
3. Browse the **Marketplace Analytics** tab:
   - ✅ Assert gross sales volume, commission fees, net payouts, and total orders match database aggregates.
   - ✅ Verify the **Product Category Share** horizontal progress bars render category ratios accurately.
   - ✅ Verify the **Recent Marketplace Activity** table displays the 5 most recent orders with dates, order IDs, recipient names, payment methods, and statuses.

### 2. Vendor Management
1. Select the **Vendor Management** tab.
2. Search a vendor by name, email, or vendor code.
3. ✅ Assert that the listed items, cumulative gross sales, commission, and net payouts align with that vendor's settlements.
4. Click **"Inspect Details"** on a vendor row:
   - ✅ Verify the profile details modal pops up displaying the name, email, phone, registered warehouse address, operational code, and net payout stats.

### 3. System Monitoring
1. Select the **System Monitoring** tab.
2. Check JVM Memory Diagnostics:
   - ✅ Verify that the progress bar displays correct used memory percentage relative to max JVM memory size.
3. Check Uploads Storage Capacity Status:
   - ✅ Verify the total count of image files and total space consumed (MB) inside the `uploads/` directory match the values calculated from the backend scan.
4. Check Database Tables Row Telemetry:
   - ✅ Verify row counts are retrieved and displayed for core tables: `users`, `products`, `orders`, `settlements`, `refunds`.
5. Check pings for API status (`ONLINE`), PostgreSQL connection (`UP`), and Razorpay SDK (`CONFIGURED`).

### 4. Business Reports & CSV Export
1. Select the **Business Reports** tab.
2. Choose a category from the **Select Report Category** dropdown (e.g. *Sales & Checkouts Report*, *Merchants Performance Report*, *Inventory Valuation Report*, *Returns & Refund QC Report*).
3. Search or filter results using the search input.
4. Click **"Export to CSV"** at the top right:
   - ✅ Verify that a file download is initiated (e.g. `report_sales_172409...csv`).
   - ✅ Open the downloaded file and assert that the headers (e.g. *Order ID, Date, Recipient Name, Payment Method, Payment Status, Total Amount*) and values are formatted correctly as a standard comma-separated text table.

---

# 📦 ShopStack — Day 9: Fixed 10% Platform-Wide Commission Rate & Settlement Auditing

This milestone implements a fixed 10% platform-wide commission rate for all vendors, deprecates vendor-specific overrides, and exposes backend REST APIs and Admin Dashboard views for records retrieval and settlement tracking.

---

## 📌 Day 9 Deliverables & Major Enhancements

### 1. Fixed Platform-Wide Commission Rate
- [x] **Vendor-Specific Override Removal:** Deprecated individual vendor `commission_rate` customizations, forcing all calculations to follow the global platform default of 10.0%.
- [x] **Global Fixed Commission:** The backend automatically applies the system default rate (`shopstack.commission.percentage=10.0` in `application.properties`) for all vendor settlements.
- [x] **Attribution & Fixed Calculation:** In `PaymentService.java`, the system calculates the corresponding platform commission (10%) and allocates the remainder to the vendor as a net payout.

### 2. REST API Endpoints
- [x] **On-the-Fly Calculation API:** Introduced `/api/commission/calculate` to verify splits based on gross amount (and optional custom simulation rates, while ignoring individual vendor profile rates).
- [x] **Auditable Records Retrieval:** Exposes `/api/commission/records` to filter past settlements by order ID or vendor ID.
- [x] **Disabled Modification Endpoint:** The `PUT /api/admin/vendors/{vendorId}/commission-rate` endpoint is disabled and returns a `400 Bad Request` explaining that rates are fixed at 10.0%.

### 3. Frontend Admin Controls
- [x] **Read-Only Inspect Modal Display:** Removed the numerical commission percentage input and "Update" button from the Vendor operation details modal in the Admin Dashboard, replacing it with a static `10%` display.
- [x] **Static Table Statistics:** Displays the fixed 10% commission rate next to each vendor's cumulative commissions paid.

### 4. Cash on Delivery (COD) Payment & Payout Settlement Flow
- [x] **Auto-Settlement on COD Deliveries (`VendorController.updateOrderStatus`):** When a COD order's status transitions to `DELIVERED` via the Warehouse/Vendor console, the backend automatically sets the payment status to `PAID` and triggers settlement record creation using the fixed 10% commission rate.

---

## 📡 API Endpoints (Day 9)

Method | Endpoint | Description
------ | -------- | -----------
GET | `/api/commission/calculate` | Calculates splits on-the-fly for a gross `amount` (defaults to 10%, accepts optional manual `rate` parameter for simulation)
GET | `/api/commission/records` | Retrieves commission/settlement records filtered by optional `vendorId` or `orderId`
PUT | `/api/admin/vendors/{vendorId}/commission-rate` | [DISABLED] Returns `400 Bad Request` since commission rate is fixed at 10%

---

## 🧪 Testing Checklist & Verification Guide (Day 9)

### 1. Global Fixed Calculations (10% Rate)
1. Place an order for ₹10,000.
2. Confirm the payment status is marked `PAID`.
3. In **Admin Dashboard -> Commission Management**, verify that a settlement is created with:
   - ✅ Gross Amount: ₹10,000
   - ✅ Commission Rate: 10%
   - ✅ Commission Amount: ₹1,000
   - ✅ Net Vendor Payout: ₹9,000

### 2. Custom Commission Rates Disabled
1. Log in as an Administrator, open the **Vendors** tab, and click **Inspect Details** on a vendor.
2. Verify that there is no input box or "Update" button, and the commission rate is displayed as static `10%`.
3. Verify that sending a `PUT /api/admin/vendors/{vendorId}/commission-rate` request directly returns a `400 Bad Request` status.

### 3. COD Order Settlement & Payment Transition
1. Place a Cash on Delivery (COD) order.
2. In the Admin Dashboard -> Commission Management, verify that **no settlement record** exists for this order yet (since payment is pending).
3. Log in as Warehouse Staff and change the order's status to **`DELIVERED`** (which calls the vendor status update API).
4. As an Admin, verify:
   - ✅ In **Commission Management**, the settlement record has now been automatically generated.
   - ✅ In **Payment Monitoring**, the order's payment status has automatically changed from `PENDING` to **`PAID`**.

### 4. Automated Test Suite Integration
1. Run `mvn test -Dtest=CommissionCalculationTests` inside the `backend` folder.
2. ✅ Verify that all 5 tests pass successfully with a `BUILD SUCCESS` output status.

---

# 🏷️ ShopStack — Day 10: Coupon & Promotion Engine (Enterprise Multi-Vendor Campaign Architecture)

This milestone introduces a robust **Coupon and Promotion Engine** that empowers Administrators to orchestrate platform-wide campaigns, allows Vendors to selectively accept/reject campaigns and map specific products to them, enables Customers to search and apply valid discount coupons during checkout, tracks every single coupon application, and aggregates deep performance metrics and analytics.

---

## 📌 Workflow & System Architecture

### 1. Complete Business Workflow
```text
Admin Creates Coupon (Active)
      │
      ▼
Vendors Review Campaign
      │
      ├───────────────────────────────┐
      ▼ (Accepts)                     ▼ (Rejects / Ignores)
Maps Products & Approves          Coupon Not Applicable
      │                               │
      └──────────────┬────────────────┘
                     ▼
Customer Adds Products to Cart
                     │
                     ▼
Customer Proceeds to Checkout (Views Filtered Coupon Options)
                     │
                     ▼
Customer Selects & Applies Coupon Code
                     │
                     ▼
Backend Validation: Exists? Active? Temporal bounds? Min Order? Usage limit? Product eligibility mapping?
                     │
      ┌──────────────┴──────────────┐
      ▼ (Valid)                     ▼ (Invalid)
Calculate Discount              Reject with Error Msg
(Percentage / Fixed)
      │
      ▼
Update Order Checkout Total (Reflected in Razorpay/COD Payment flow)
      │
      ▼
Confirm Checkout Order
      │
      ▼
Record Usage Track (Usage Count Increment & CouponUsage log)
      │
      ▼
Admin Reviews Campaign Analytics (Total uses, total discounts, client-level auditing)
```

### 2. Full Technical Data Flow
The Coupon Engine follows a modern, decoupled MVC architectural pattern spanning the database storage up to the client layer:
```mermaid
sequenceDiagram
    autonumber
    actor Admin as Administrator
    actor Vendor as Merchant
    actor Customer as Shopper
    participant React as React UI (Vite)
    participant Axios as Axios / API Client
    participant Controller as Spring Boot Controller
    participant Service as Coupon Service (Logic)
    participant DB as PostgreSQL Database

    %% Admin Workflow
    Admin->>React: Fills Create Coupon Form
    React->>Axios: POST /api/coupons
    Axios->>Controller: createCoupon(Coupon)
    Controller->>Service: createCoupon()
    Service->>DB: Save in `coupons` table
    DB-->>React: HTTP 200 (Active Coupon Created)

    %% Vendor Mapping Workflow
    Vendor->>React: Opens campaigns tab & clicks "Accept"
    React->>Axios: GET /api/coupons/{code}/products (Pre-populate)
    Vendor->>React: Selects specific products & approves
    React->>Axios: POST /api/coupons/vendor/{vendorId}/approve
    Axios->>Controller: approveCoupon(payload)
    Controller->>Service: setVendorCouponStatusWithProducts()
    Service->>DB: Write to `vendor_coupon_approvals` & `product_coupons`
    DB-->>React: HTTP 200 (Coupon accepted)

    %% Customer Application Workflow
    Customer->>React: Navigates to Checkout
    React->>Axios: Promise.all(/api/coupons, /approvals, /mappings)
    Axios-->>React: Return coupon meta & mappings
    Note over React: Filters coupons: Strikethrough & [Not Applicable]<br/>if cart items do not map to the campaign
    Customer->>React: Applies coupon code
    React->>Axios: POST /api/coupons/validate (cart items, code, userId)
    Axios->>Controller: validateCoupon(payload)
    Controller->>Service: validateAndCalculateDiscount(code, items, userId)
    Service->>DB: Read Coupon details & check product mappings
    alt Validation Passes
        Service-->>React: Return discountAmount & finalAmount (valid: true)
        Note over React: Update Razorpay / COD payment totals
    else Validation Fails (Expired, Min Order not met, Usage limit exceeded)
        Service-->>React: Return bad request message (valid: false)
    end

    %% Order Submission & Usage Tracking
    Customer->>React: Submits Order Payment
    React->>Axios: Submit Order Payload
    Axios->>Controller: Process Order checkout
    Controller->>Service: recordUsage(code, userId, orderId, discount)
    Service->>DB: Increment coupon usage_count & write to `coupon_usages`
```

---

## 📌 Deliverables & Core Features

### 1. Admin — Coupon Creation & Lifecycle Management
Administrators can create, update, delete, and toggle coupon campaigns from a dedicated portal. Key metadata configured per coupon:
*   **Coupon Code:** Unified alphanumeric uppercase identifier (e.g. `SAVE20`, `BBD1000`).
*   **Discount Type:** Supports dynamic `PERCENTAGE` discount calculation or static `FIXED` amount deduct.
*   **Discount Value:** The numerical value (e.g., 20% discount or ₹500 flat off).
*   **Minimum Order Amount:** Configurable minimum order subtotal required to qualify (e.g., must order $\ge$ ₹1,000).
*   **Maximum Discount Amount:** Upper limit cap on percentage discounts to control platform budget loss (e.g., 20% off up to ₹400).
*   **Temporal Bounds (Start & Expiry Date/Time):** Minute-level precision mapping of campaign validity windows using `java.time.LocalDateTime`.
*   **Usage Limit:** Hard cap on the total number of times the coupon can be successfully applied platform-wide.
*   **Active Status Toggle:** Quick status flag allowing immediate manual disablement or enablement of campaigns.

### 2. Customer — Coupon Browsing & Checkout Application
The client frontend streamlines the shopper's path to purchase:
*   **Checkout Application:** Shoppers can pick an active coupon from a dropdown or manually enter a coupon code during checkout in the Address & Payment selector.
*   **Immediate Financial Recalculation:** Applying a coupon recomputes the cart total immediately, displaying:
    *   Subtotal savings.
    *   Applied coupon discount deduction.
    *   Final updated payable amount.
*   **Visual Eligibility Feedback:** Integrates client-side mappings evaluation. If items in the cart do not match the vendor-accepted products, the coupon renders in the dropdown with a visual `line-through` and `[Not Applicable]` tag.

### 3. Backend Validation Engine
On coupon application, the service layers execute high-precision validation rules:
*   **Existence:** Asserts code maps to an existing coupon in PostgreSQL.
*   **Active Status:** Verifies that `active` is set to `true`.
*   **Temporal Check:** Validates that the current time (`LocalDateTime.now()`) falls strictly between `startDate` and `expiryDate`.
*   **Minimum Order Check:** Validates that the sum total of all cart items meets or exceeds `minOrderAmount`.
*   **Usage Limit Check:** Ensures that the cumulative application count `usageCount` is less than `usageLimit`.
*   **Fine-Grained Product Mapping:** Iterates cart items and verifies that the specific product is opted-in and mapped to the coupon campaign via `product_coupons` mappings. If a subset of items is ineligible, their pricing is excluded from discount calculations and listed on a warning info banner.

### 4. Discount & Payment Integration
Calculates discounts accurately on both the client side and server side:
*   **Percentage discount:** Computes value using:
    $$\text{Discount} = \min\left(\text{Eligible Subtotal} \times \frac{\text{Value}}{100}, \text{Max Discount Cap}\right)$$
*   **Fixed discount:** Applies the flat value directly, capping it at the eligible subtotal.
*   **Secure Payment Syncing:** The final updated amount is verified on signature completion and transmitted directly into Razorpay order generation or COD order confirm logs to prevent checkout vulnerabilities.

### 5. Transactional Coupon Tracking
Maintains audit logs for historical settlements:
*   Every application registers a new record in `coupon_usages` containing the coupon code, customer ID, customer email, generated unique order ID, calculated discount amount, and timestamp (`LocalDateTime`).
*   The parent `Coupon` entity's `usage_count` is incremented.

### 6. Analytics Dashboard
Provides platform operators with business intelligence metrics:
*   **Performance Metrics:** Displays total times a coupon was used, total discounts disbursed, and active campaign status.
*   **Granular Usage Logs:** Provides a detailed table showcasing user details, associated order references, and exact discount values.

---

## ⚡ Day 10 Advanced Enhancements

*   **Selective Product-Coupon Mapping:** Deprecated the binary global boolean flag on the products table. Replaced with the relational entity [`ProductCoupon.java`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/backend/src/main/java/com/shopstack/backend/model/ProductCoupon.java) and mapping table `product_coupons`. Vendors can selectively opt-in specific items or all products.
*   **Dynamic Pre-populated Selection:** Toggling campaign acceptances fetches current selective product mapping arrays (`GET /api/coupons/{code}/products`) allowing vendors to inspect and modify selections without resetting them from scratch.
*   **High-Performance checkout lookup:** Concurrently queries active campaigns, approvals, and mapping records using `Promise.all` on checkout load to eliminate redundant API delays.
*   **LocalDateTime Migration:** Migrated backend schema columns for `start_date` and `expiry_date` in table `coupons` to `timestamp without time zone` columns, mapping to `LocalDateTime` models in [`Coupon.java`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/backend/src/main/java/com/shopstack/backend/model/Coupon.java) for minute-level verification.
*   **Keyboard Date-Time Inputs:** Replaced default dropdown date selectors with split text boxes validating inputs against `YYYY-MM-DD` and `HH:MM` patterns via client-side regex rules.
*   **Cascading Updates & Resets:**
    *   **Rename Cascade:** Editing a coupon code updates associated vendor approvals and product mappings.
    *   **Delete Cascade:** Deleting a coupon automatically cleans up references in mappings and approvals.
    *   **Edit-Reset Trigger:** Changing coupon parameters (rate, cap, dates, code) resets vendor approval states back to `AWAITING CONFIRMATION` and clears existing product mappings, ensuring merchants re-accept modified terms.

---

## 📂 Project Structure Updates (Day 10)

```text
ShopStack/
├── backend/
│   └── src/main/java/com/shopstack/backend/
│       ├── model/
│       │   ├── Coupon.java                      # JPA Entity for Coupon meta data (LocalDateTime temporal fields)
│       │   ├── CouponUsage.java                 # JPA Entity logging coupon applications
│       │   ├── VendorCouponApproval.java        # JPA Entity tracking merchant acceptances
│       │   └── ProductCoupon.java               # JPA Entity mapping selective products to coupons
│       ├── repository/
│       │   ├── CouponRepository.java            # JPA repository interface for Coupon
│       │   ├── CouponUsageRepository.java       # JPA repository interface for CouponUsage
│       │   ├── VendorCouponApprovalRepository.java # JPA repository interface for VendorCouponApproval
│       │   └── ProductCouponRepository.java      # JPA repository interface for ProductCoupon mappings
│       ├── controller/
│       │   └── CouponController.java            # REST APIs (/api/coupons) for Admin CRUD, validation & approvals
│       └── service/
│           └── CouponService.java               # Core validations, discount formulas, and analytics aggregates
│
└── frontend/
    └── src/
        └── components/
            ├── AdminDashboard.jsx               # Coupon Manager: create form, split inputs, list & analytics
            ├── VendorDashboard.jsx              # Acceptance console, selective product selector modal
            ├── CustomerDashboard.jsx            # Checkout validation integration & filtered options list
            └── HomeDashboard.jsx                # Checkout validation integration & filtered options list
```

---

## 📡 API Endpoints (Day 10)

### Campaign & Discount Operations
Method | Endpoint | Description | Payload Format / Response Model
------ | -------- | ----------- | ------------------------------
GET | `/api/coupons` | Fetch all coupons in the system | Returns List of [`Coupon`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/backend/src/main/java/com/shopstack/backend/model/Coupon.java) entities
POST | `/api/coupons` | Create a new campaign | Body: `Coupon` object. Returns saved `Coupon`
PUT | `/api/coupons/{id}` | Update existing coupon meta & **triggers edit-reset** | Body: `Coupon` object. Returns updated `Coupon`
PUT | `/api/coupons/{id}/toggle` | Toggle coupon active status | Returns modified `Coupon`
DELETE | `/api/coupons/{id}` | Delete coupon and **cascade cleanup** related maps | Returns HTTP 200 String
POST | `/api/coupons/validate` | Validates coupon subtotal and calculates discount | Body: `{"code": String, "userId": Long, "items": List}`. Returns calculations map

### Vendor & Product Mappings
Method | Endpoint | Description | Payload Format / Response Model
------ | -------- | ----------- | ------------------------------
GET | `/api/coupons/approvals` | Fetch all vendor-campaign approvals | Returns List of [`VendorCouponApproval`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/backend/src/main/java/com/shopstack/backend/model/VendorCouponApproval.java)
GET | `/api/coupons/mappings` | Fetch all product-coupon mappings | Returns List of [`ProductCoupon`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/backend/src/main/java/com/shopstack/backend/model/ProductCoupon.java)
GET | `/api/coupons/{code}/products` | Fetch mapped product IDs for a coupon code | Returns Array of product ID Longs
GET | `/api/coupons/vendor/{vendorId}` | Fetch coupons with approval status for a vendor | Returns List of maps containing coupon and status details
POST | `/api/coupons/vendor/{vendorId}/approve` | Approve a campaign with selective product mapping | Body: `{"couponCode": String, "applyToAll": Boolean, "productIds": List<Long>}`
POST | `/api/coupons/vendor/{vendorId}/reject` | Reject a campaign | Body: `{"couponCode": String}`

### Reporting & Diagnostics
Method | Endpoint | Description | Payload Format / Response Model
------ | -------- | ----------- | ------------------------------
GET | `/api/coupons/analytics` | Fetch analytics details for campaigns | Returns List of maps (usages, total discount, history list)

---

## 🗄️ Database Schema Mapping Details

### 1. Table: `coupons`
Stores campaign details and limits.
*   `id` (BIGINT, PRIMARY KEY)
*   `code` (VARCHAR, UNIQUE)
*   `discount_type` (VARCHAR) - `PERCENTAGE` or `FIXED`
*   `discount_value` (DOUBLE PRECISION)
*   `min_order_amount` (DOUBLE PRECISION, NULLABLE)
*   `max_discount` (DOUBLE PRECISION, NULLABLE)
*   `start_date` (TIMESTAMP WITHOUT TIME ZONE)
*   `expiry_date` (TIMESTAMP WITHOUT TIME ZONE)
*   `usage_limit` (INTEGER, NULLABLE)
*   `usage_count` (INTEGER, Default: 0)
*   `active` (BOOLEAN, Default: true)

### 2. Table: `coupon_usages`
Logs coupon usages for orders.
*   `id` (BIGINT, PRIMARY KEY)
*   `coupon_code` (VARCHAR)
*   `user_id` (BIGINT)
*   `user_email` (VARCHAR)
*   `order_id` (VARCHAR)
*   `discount_amount` (DOUBLE PRECISION)
*   `usage_date_time` (TIMESTAMP WITHOUT TIME ZONE)

### 3. Table: `vendor_coupon_approvals`
Tracks merchant consent for campaigns.
*   `id` (BIGINT, PRIMARY KEY)
*   `vendor_id` (BIGINT)
*   `coupon_code` (VARCHAR)
*   `status` (VARCHAR) - `APPROVED`, `REJECTED`, or `PENDING`

### 4. Table: `product_coupons`
Binds eligible products to coupons.
*   `id` (BIGINT, PRIMARY KEY)
*   `product_id` (BIGINT) - Foreign key referencing `products.id`
*   `coupon_code` (VARCHAR) - Foreign key referencing `coupons.code`

---

## 🧪 Testing Checklist & Verification Guide

### 1. Admin Coupon Creation & Editing
1. Log in as an **Administrator** and navigate to the **Coupons** tab.
2. Click **Create Coupon** and input details:
   - Code: `SAVE20`
   - Type: `PERCENTAGE`
   - Value: `20`
   - Min Order: `1000`
   - Max Discount: `400`
   - Start Date/Time: Fill valid present values (e.g. `2026-08-01 00:00`)
   - Expiry Date/Time: Fill future values (e.g. `2026-08-30 23:59`)
   - Usage Limit: `10`
3. Click Save. Assert `SAVE20` appears in the campaigns table.
4. Click Edit on `SAVE20`. Update Min Order to `1200` and save.
   - Verify that any vendor mappings/approvals for `SAVE20` are reset.
5. Click the toggle active switch. Verify the status updates.

### 2. Merchant Approval & Selective Product Mapping
1. Log in as a **Vendor**. Go to the **Coupons** section.
2. Locate `SAVE20` (marked as `AWAITING CONFIRMATION`). Click **Accept**.
3. Select **"Select Specific Products"**, check only Product A, and save.
4. Locate `BBD1000`, click **Accept**, select **"Apply to All Products"**, and save.
5. Click Accept/Edit on `SAVE20` again and verify Product A remains checked.

### 3. Customer Application & Validation Checkout
1. Log in as a **Customer**. Add Product A (priced at ₹1,500) to the cart.
2. Go to **Checkout**:
   - Verify `SAVE20` is selectable.
   - Verify that `SAVE20` shows `(Expires: 2026-08-30 23:59)`.
3. Apply `SAVE20`:
   - Assert discount calculations: $1500 \times 0.20 = ₹300$ off. Final payable: ₹1,200.
4. Add Product B (not mapped to `SAVE20`, priced at ₹800) to the cart instead:
   - Verify `SAVE20` is displayed with a `line-through` style and marked `[Not Applicable]` in the dropdown.
   - Try entering `SAVE20` manually and clicking Apply. Assert validation fails with an error: *"None of the items in your cart are eligible for this coupon."*
5. Add both Product A (₹1,500) and Product B (₹800) to the cart. Subtotal: ₹2,300.
   - Apply `SAVE20`.
   - Assert calculations: discount applies only to Product A ($1500 \times 0.20 = ₹300$). Discount amount is ₹300. Payable amount is ₹2,000.
   - Assert the warning banner displays: `ℹ️ Excluded items: Product B`.

### 4. Usage Limits & Temporal Expiries
1. Edit coupon `SAVE20` to set `Usage Limit` to `1` (or change `Expiry Date` to a past timestamp).
2. As a Customer, apply `SAVE20` and complete the checkout order.
3. Try placing a second order with `SAVE20` as another customer.
   - Assert validation fails showing *"Coupon usage limit has been reached."* (or *"Coupon has expired."*).

### 5. Tracking & Analytics Audit
1. Navigate to **Admin Dashboard -> Coupon Analytics**.
2. Locate `SAVE20` row:
   - Verify the usage count has increased.
   - Verify that total discounts provided correctly sums up calculations.
   - Click the info detail viewer to audit user details, order ID, and timestamp logs.

---

# 🏭 ShopStack — Day 11: Warehouse Allocation Workflow

This milestone introduces an enterprise-grade **Warehouse Allocation Workflow & Logistics Engine** with strict **Role-Based Workflow Separation**, **Vendor Source Origin & Multi-Hub Stock Distribution**, a **1-Time Order Allocation Desk**, a **Pick → Pack → Ship Fulfillment Pipeline**, a dedicated **Warehouse Staff** platform role, and a condition-aware **Defective & Damaged Return Quarantine Engine**.

---

## 📌 Architecture & Workflow System Design

```mermaid
flowchart TD
    A["Vendor Keeps Stock in Catalog<br/>(Vendor Origin)"] -->|"Admin Distributes Stock via Multi-Hub Ledger"| B["Regional Warehouses<br/>(Kolkata, Mumbai, Delhi, Bangalore)"]
    B --> C["Customer Places Order (CONFIRMED)"]
    C --> D["Admin 1-Time Order Allocation Desk"]
    D -->|"Facility Allocation Locked (1-Time)"| E["Specifically Allocated Warehouse Staff Dashboard"]
    E --> F["Pick Product from Bin Location"]
    F --> G["Pack Product with Custom Packaging"]
    G --> H["ShopStack Express Dispatch (READY_FOR_SHIPPING)"]
    H --> I["Customer Delivery Completed (DELIVERED)"]
```

---

## 📌 Deliverables & Core Capabilities (Day 11)

### 1. Role-Based Workflow Separation
* **Administrator Responsibilities**:
  - Manage the physical fulfillment network (**Kolkata**, **Mumbai**, **Delhi**, **Bangalore** hubs), operational capacity, and geographic coordinates.
  - Distribute vendor catalog stock across regional fulfillment centers.
  - Operate the **1-Time Order Allocation Desk** to route incoming customer orders to the optimal facility.
  - Oversee multi-hub stock ledgers, regional transfers, and return dispute resolution.
* **Warehouse Staff Responsibilities**:
  - Associated with a specific regional warehouse hub.
  - Receive real-time alerts when orders are allocated to their facility.
  - Manage the facility-specific Picking queue and generate picklists.
  - Pack orders with designated packaging materials (Standard Box, Fragile Padded, Heavy Duty Corrugated).
  - Prepare shipments, generate tracking numbers via **ShopStack Express**, and update stock movements.
  - Perform Inward Returns Quality Control (QC) inspection and process Damaged Stock Dispositions.
* **Vendor Responsibilities**:
  - Maintain product catalog listings, images, pricing, and stock quantities.
  - Retain full economic/financial ownership of listed inventory.
  - Note: Vendors do not send direct inbound consignments to warehouses; the Admin centrally distributes vendor catalog stock.

---

### 2. Vendor Source Origin & Multi-Hub Stock Distribution
* **Source Origin (Vendor)**: Products listed by the vendor in the catalog serve as the single source of truth for stock quantities and financial attribution.
* **Centralized Multi-Hub Stock Ledger**: Platform Administrator distributes and balances physical inventory across regional facilities:
  - **Kolkata Regional Fulfillment Hub (`WH-KOL-01`)**
  - **Mumbai Central Warehouse (`WH-MUM-01`)**
  - **Delhi Northern Logistics Hub (`WH-DEL-02`)**
  - **Bangalore Southern Mega Hub (`WH-BLR-03`)**
* **Distribution Presets & Allocation**:
  - `⚡ 40/30/20/10 Split` (40% Kolkata, 30% Mumbai, 20% Delhi, 10% Bangalore)
  - `⚡ Equal Split` (25% each hub)
  - Single-warehouse custom buffer allocation.
* **Real-Time Global Stock Sync**: Every warehouse stock adjustment automatically recalculates and synchronizes the product's platform-wide catalog stock (`syncProductGlobalStock`).

---

### 3. One-Time Order Allocation System
* **Awaiting Allocation Queue**: The Admin Order Allocation Desk defaults strictly to pending, unassigned customer orders.
* **Instant Queue Clearance**: Upon submitting facility allocation (or using `⚡ Auto-Allocate`), the order is immediately locked, stock is reserved in the designated hub, and the order is cleared from the pending allocation desk.
* **Locked Allocation State**: In history or all-orders views, allocated orders show a permanent confirmation badge (`✓ Allocation Complete (1-Time)`) and cannot be re-allocated, preventing duplicate routing errors.

---

### 4. Pick → Pack → Ship Fulfillment Pipeline
Each `WarehouseAllocation` progresses through an explicit status pipeline: **ALLOCATED → PICKED → PACKED → READY_FOR_SHIPMENT → DELIVERED**.
* **PICKED**: Confirms the item has been physically located and verified in the warehouse bin location.
* **PACKED**: Captures the chosen `packagingType` (Standard Box, Fragile Padded, Eco-Friendly).
* **READY_FOR_SHIPMENT**: Captures `courierPartner` (`ShopStack Express`) and `trackingNumber`, **deducts physical inventory quantity** from the facility, and releases the corresponding `allocated` reservation.
* **Order Status Propagation**: Every allocation status change automatically syncs the parent `Order.status` (`PICKED` / `PACKED` / `SHIPPED` / `DELIVERED`), keeping Customer, Vendor, and Admin dashboards synchronized in real time.
* **COD Auto-Settlement**: Marking a COD order `DELIVERED` automatically flips its `paymentStatus` to `PAID` and generates vendor settlement records.

---

### 5. Defective & Damaged Return Quarantine Engine
Automatic condition-aware inventory routing based on customer return reason category:
* **`DEFECTIVE_DAMAGED` (Defective / Damaged Items)**:
  - Automatically routed into **Damaged & Quarantine Stock** (`inv.damagedQuantity`).
  - **Main Sellable Stock is NOT Restored**: Sellable inventory (`inv.quantity`) remains reduced to protect retail catalog integrity.
  - Accessible under the Warehouse **Damaged & Quarantine** tab for disposition (Write-Off / Scrap, Return to Vendor RTV, or Refurbish).
* **Non-Defective Reasons (`WRONG_ITEM`, `CHANGED_MIND`, `SIZE_FIT`, etc.)**:
  - Identified as resellable goods.
  - Upon warehouse package receipt and QC approval, **Main Sellable Stock is Restored** (`inv.quantity` incremented) and synchronized with the global marketplace catalog.

```mermaid
flowchart TD
    R["Customer Return Request"] --> S["Warehouse Staff Receives Package (ITEM_RETURNED)"]
    S --> T{"Customer Return Reason?"}
    T -->|"DEFECTIVE_DAMAGED"| U["Move to Damaged & Quarantine Stock<br/>(Sellable Stock Remains Reduced)"]
    T -->|"WRONG_ITEM / CHANGED_MIND / SIZE_FIT"| V["QC Passed: Restore Main Sellable Stock<br/>(inv.quantity Incremented)"]
    U --> W["Quarantine Actions: Write-Off / RTV / Refurbish"]
    V --> X["Live Catalog Stock Synchronized"]
```

---

## 📂 Project Structure Updates (Day 11)

```text
ShopStack/
├── backend/
│   └── src/main/java/com/shopstack/backend/
│       ├── model/
│       │   ├── Warehouse.java                 # JPA Entity for physical fulfillment hubs
│       │   ├── Inventory.java                 # JPA Entity: per-warehouse stock, damaged quarantine & allocation
│       │   ├── WarehouseAllocation.java        # JPA Entity: order-item ↔ warehouse fulfillment tracking
│       │   ├── StockTransfer.java             # JPA Entity: Vendor stock distribution & inter-hub transfers
│       │   ├── Product.java                   # Extended: returnPolicy (7_DAYS / 15_DAYS / NON_RETURNABLE)
│       │   └── User.java                      # Extended: role includes WAREHOUSE_STAFF
│       ├── repository/
│       │   ├── WarehouseRepository.java
│       │   ├── InventoryRepository.java
│       │   ├── WarehouseAllocationRepository.java
│       │   └── StockTransferRepository.java
│       ├── controller/
│       │   ├── WarehouseController.java        # REST APIs for hubs, inventory, distribution, allocations
│       │   └── StockTransferController.java    # REST APIs for stock distribution and transfers
│       ├── service/
│       │   ├── WarehouseService.java           # Allocation algorithm, fulfillment workflow, distribution
│       │   └── StockTransferService.java       # Stock distribution & movement tracking
│       └── config/
│           ├── DataLoader.java                 # Seeds Kolkata, Mumbai, Delhi, Bangalore & initial stock
│           └── SecurityConfig.java             # Permits /api/warehouses/**, /api/stock-transfers/**
│
└── frontend/
    └── src/
        └── components/
            ├── WarehouseDashboard.jsx          # Fulfillment Pipeline, Stock, Returns & QC, Damaged Quarantine
            ├── AdminDashboard.jsx              # Order Allocation Desk, Multi-Hub Stock Ledger, Facility Network
            ├── Login.jsx / Register.jsx        # Warehouse Staff role option (@staff email gating)
            └── CustomerDashboard.jsx            # Order tracking & Return request UI
```

Related Code Files:
- [`Warehouse.java`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/backend/src/main/java/com/shopstack/backend/model/Warehouse.java)
- [`Inventory.java`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/backend/src/main/java/com/shopstack/backend/model/Inventory.java)
- [`WarehouseAllocation.java`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/backend/src/main/java/com/shopstack/backend/model/WarehouseAllocation.java)
- [`StockTransfer.java`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/backend/src/main/java/com/shopstack/backend/model/StockTransfer.java)
- [`WarehouseController.java`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/backend/src/main/java/com/shopstack/backend/controller/WarehouseController.java)
- [`WarehouseService.java`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/backend/src/main/java/com/shopstack/backend/service/WarehouseService.java)
- [`WarehouseDashboard.jsx`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/frontend/src/components/WarehouseDashboard.jsx)
- [`AdminDashboard.jsx`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/frontend/src/components/AdminDashboard.jsx)

---

## 📡 API Endpoints (Day 11)

### Warehouse CRUD & Facilities
Method | Endpoint | Description | Payload Format / Response Model
------ | -------- | ----------- | ------------------------------
GET | `/api/warehouses` | List all warehouses | Returns List of `Warehouse`
GET | `/api/warehouses/{id}` | Get a single warehouse | Returns `Warehouse`
POST | `/api/warehouses` | Create a warehouse | Body: `Warehouse`. Returns saved `Warehouse`
PUT | `/api/warehouses/{id}` | Update warehouse details | Body: `Warehouse`. Returns updated `Warehouse`
DELETE | `/api/warehouses/{id}` | Delete a warehouse | Returns HTTP 200

### Inventory & Stock Distribution
Method | Endpoint | Description | Payload Format / Response Model
------ | -------- | ----------- | ------------------------------
GET | `/api/warehouses/inventory/all` | List all inventory records across all warehouses | Returns enriched List of maps (warehouse/product names, quantity, allocated, available, damaged)
GET | `/api/warehouses/{id}/inventory` | List inventory for a specific warehouse | Returns List of `Inventory`
POST | `/api/warehouses/distribute-stock` | Distribute vendor product stock across warehouses | Body: `{"productId": Long, "distributions": [{"warehouseId": Long, "quantity": Int}]}`
POST | `/api/warehouses/damaged-stock/{invId}/action` | Process disposition for damaged quarantine inventory | Body: `{"action": "WRITE_OFF"/"RETURN_TO_VENDOR"/"REFURBISHED", "quantity", "notes"}`

### Allocation & Fulfillment
Method | Endpoint | Description | Payload Format / Response Model
------ | -------- | ----------- | ------------------------------
GET | `/api/warehouses/allocations` | List all allocations with product/warehouse context | Returns enriched List of maps
POST | `/api/warehouses/orders/{orderId}/allocate-warehouse` | Admin allocates order to specific warehouse | Body: `{"warehouseId": Long}`
POST | `/api/warehouses/allocations/allocate/{orderId}` | Auto-allocate stock for an order | Returns List of `WarehouseAllocation`
PUT | `/api/warehouses/allocations/{id}/status` | Advance fulfillment status | Body: `{"status": "PICKED"/"PACKED"/"READY_FOR_SHIPMENT", "packagingType", "courierPartner", "trackingNumber"}`
GET | `/api/warehouses/analytics` | Aggregate warehouse/inventory/fulfillment metrics | Returns metrics map

---

## 🧪 Testing Checklist & Verification Guide (Day 11)

### 1. Multi-Warehouse Setup & Stock Distribution
1. Log in as **Admin** and open **Multi-Hub Stock Ledger**.
2. Confirm Kolkata, Mumbai, Delhi, and Bangalore hubs are populated.
3. Click **⚡ Distribute Stock** for a product, apply the **40/30/20/10 Split**, and confirm inventory in all 4 hubs updates.

### 2. 1-Time Order Allocation Desk
1. As a Customer, place an order for a product.
2. Log in as **Admin** and open **Warehouse Allocation → Order Allocation Desk**.
3. Confirm the order appears in **Awaiting Routing**. Select a warehouse and submit.
4. Verify the order is immediately allocated, stock is reserved in that hub, and the order is removed from the pending queue.

### 3. Fulfillment Progression
1. Log in as **Warehouse Staff** for the allocated warehouse.
2. Advance the allocation through **PICKED → PACKED → READY_FOR_SHIPMENT**, supplying packaging type, courier (`ShopStack Express`), and tracking number.
3. Confirm physical inventory quantity decreases at `READY_FOR_SHIPMENT`, and the customer's Order status updates to `SHIPPED`.
4. Mark the order `DELIVERED` for a COD order and confirm `paymentStatus` flips to `PAID`.

---

# 📦 ShopStack — Day 12: Return and Refund Management

This milestone establishes an end-to-end **Return and Refund Management (RMA) Architecture** spanning physical package arrival tracking (`ITEM_RETURNED`) at the specifically allocated warehouse, gated QC inspections, condition-aware stock routing, **Real-Time Financial Analytics & Refund Profit Deductions**, and interactive manual refresh controls across all operator dashboards.

---

## 📌 Architecture & Lifecycle State Transitions

```mermaid
flowchart TD
    A["1. Customer Requests Return (REQUESTED)"] --> B["2. Admin Reviews & Approves Return"]
    B --> C["3. Allocated Warehouse Receives Package (ITEM_RETURNED)"]
    C --> D{"4. Warehouse Staff QC Inspection"}
    D -->|"Defective / Damaged"| E["Route to Damaged Quarantine<br/>(Sellable Stock NOT Restored)"]
    D -->|"Resellable / Intact"| F["QC Passed: Restore Main Sellable Stock<br/>(inv.quantity Incremented)"]
    E --> G["5. Admin Disburses Refund (REFUNDED)"]
    F --> G
    G --> H["Real-Time Financial Analytics Deductions<br/>(Net Sales, 10% Commission & Vendor Payout Reversal)"]
```

### Complete RMA Status Sequence:
1. **`REQUESTED` / `ADMIN_APPROVED`**:
   - Customer submits return request with reason category, notes, and optional photo.
   - Admin audits and approves return. Warehouse and Admin consoles show state as `Awaiting Package Pickup` / `AWAITING PICKUP`.
   - **Customer Roadmap**: Step 1 (`Requested`) is active.
2. **`ITEM_RETURNED`**:
   - Triggered when Warehouse Staff at the allocated facility clicks **"Receive Package"** (`PUT /api/payment/refunds/{refundId}/receive`).
   - Package is officially received at the warehouse dock.
   - **Warehouse console** displays state as `QC Inspection Pending` and exposes the **"Inspect QC"** action.
   - **Customer Roadmap**: Step 2 (`Picked Up`) transitions to active.
3. **`QC_PASSED` / `QC_FAILED`**:
   - Triggered when Warehouse Staff submits inspection form (`PUT /api/payment/refunds/{refundId}/qc-inspection`).
   - Defective items are routed to Damaged Quarantine without restoring sellable inventory.
   - Resellable items restore physical inventory and sync catalog stock.
   - **Customer Roadmap**: Step 3 (`QC Passed` / `QC Failed`) transitions to active.
4. **`REFUNDED` / `REJECTED`**:
   - Admin executes refund resolution (`POST /api/admin/refunds/{refundId}/approve`).
   - Refund record is updated to `PROCESSED` with Razorpay refund ID.
   - **Customer Roadmap**: Step 4 (`Refunded`) transitions to active.

---

## 📌 Key Capabilities & Financial Governance (Day 12)

### 1. Real-Time Financial Analytics & Refund Profit Deductions
* **Marketplace Gross Sales Volume**: Dynamically calculates net retained sales (`PAID` orders minus all processed refunds). Fully refunded orders contribute `₹0`.
* **Platform Commission (10%) & Net Payouts**: Reverses and deducts platform commissions and vendor payouts for refunded orders by updating associated settlements to `REFUNDED`.
* **Vendor Sales Analytics**: Merchant revenue and items sold metrics exclude refunded orders and compute prorated deductions for partial returns.
* **Admin Payment Monitoring**: `totalPaidVolume` strictly reflects net retained payments.

### 2. Interactive Manual Refresh Controls
* Integrated instant-refresh buttons with animated sync spinners across:
  - **Vendor Dashboard**: Merchant Customer Orders, Settlements, and Return QC tabs.
  - **Warehouse Dashboard**: Fulfillment Pipeline, Local Stock, and Inward Returns queues.
  - **Admin Dashboard**: Live Payment Monitoring, Multi-Hub Stock Ledger, and Allocation Desk.

---

## 📂 Project Structure Updates (Day 12)

```text
ShopStack/
├── backend/
│   └── src/main/java/com/shopstack/backend/
│       ├── model/
│       │   ├── Refund.java                    # returnReasonCategory, resolutionType, proof images, returnStage
│       │   └── Settlement.java                # status (PENDING, SETTLED, REFUNDED)
│       ├── controller/
│       │   ├── PaymentController.java          # Return request, receive package, QC inspection endpoints
│       │   └── AdminController.java            # Net financial analytics & refund resolution endpoints
│       └── service/
│           └── PaymentService.java             # markRefundPackageReceived, processReturnQcInspection, resolveReturn
│
└── frontend/
    └── src/
        └── components/
            ├── CustomerDashboard.jsx            # RMA visual step roadmap & return request dialog
            ├── WarehouseDashboard.jsx          # Receive Package action & gated QC inspection modal
            ├── VendorDashboard.jsx             # Manual refresh controls & return dispute review
            └── AdminDashboard.jsx              # Net financial analytics, refund disbursement & monitoring
```

Related Code Files:
- [`PaymentController.java`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/backend/src/main/java/com/shopstack/backend/controller/PaymentController.java)
- [`AdminController.java`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/backend/src/main/java/com/shopstack/backend/controller/AdminController.java)
- [`PaymentService.java`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/backend/src/main/java/com/shopstack/backend/service/PaymentService.java)
- [`WarehouseDashboard.jsx`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/frontend/src/components/WarehouseDashboard.jsx)
- [`CustomerDashboard.jsx`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/frontend/src/components/CustomerDashboard.jsx)
- [`VendorDashboard.jsx`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/frontend/src/components/VendorDashboard.jsx)

---

## 📡 API Endpoints (Day 12)

### Return / Refund RMA Lifecycle
Method | Endpoint | Description | Payload Format / Response Model
------ | -------- | ----------- | ------------------------------
POST | `/api/payment/refund/request` | Customer initiates a return/refund | Body: `{"orderId", "amount", "returnReasonCategory", "resolutionType", "reason", "customerNotes", "customerProofImage"}`
GET | `/api/payment/refund/{orderId}` | Fetch refund history for an order | Returns List of `Refund`
PUT | `/api/payment/refunds/{refundId}/receive` | Warehouse staff marks return package as physically received | Returns updated `Refund`
PUT | `/api/payment/refunds/{refundId}/qc-inspection` | Warehouse staff QC inspection & quarantine routing | Body: `{"passed": Boolean, "restockOption": "DAMAGED_QUARANTINE"/"RESELLABLE", "warehouseId", "notes"}`
POST | `/api/admin/refunds/{refundId}/approve` | Admin approves return & executes refund disbursement | Body: `{"adminNotes": String}`
POST | `/api/admin/refunds/{refundId}/reject` | Admin rejects return request | Body: `{"rejectionReason": String}`

### Financial Analytics with Net Refund Deductions
Method | Endpoint | Description | Payload Format / Response Model
------ | -------- | ----------- | ------------------------------
GET | `/api/admin/dashboard-summary` | Marketplace KPI summary with net refunds deducted | Returns `totalSalesVolume`, `totalCommission`, `totalPayouts`
GET | `/api/vendor/{vendorId}/analytics` | Vendor revenue and order analytics with net deductions | Returns `totalRevenue`, `totalOrders`, `totalItemsSold`

---

## 🚦 Verification Checklist (Day 12)

### 1. RMA Package Intake & Gated QC
1. Request a return for a delivered order. Observe that **"Receive Package"** is visible on the Warehouse returns tab.
2. Click **"Receive Package"**. Assert the status changes to `"QC Inspection Pending"`, and the **"Inspect QC"** button is now exposed.

### 2. Defective/Damaged vs Resellable QC Routing
1. For a return with reason **"Defective or damaged item received"** (`DEFECTIVE_DAMAGED`), submit QC inspection.
2. Verify that physical sellable stock is **NOT** restored, and the item appears under **Damaged & Quarantine**.
3. For a return with reason **"Wrong item sent"** (`WRONG_ITEM`), submit QC inspection with `RESELLABLE`.
4. Verify that physical sellable stock in the warehouse is incremented and catalog stock syncs.

### 3. Financial Analytics Refund Deductions
1. Note the Gross Sales Volume and Platform Commission on the Admin Overview tab.
2. Approve and disburse a refund for an order.
3. Refresh analytics and verify that Gross Sales Volume, Platform Commission (10%), and Vendor Net Revenue deduct the refunded transaction amount.

---

# 🛠️ ShopStack — Day 13: System Testing & Critical Bug Fixing

This milestone delivers **System Testing and Critical Enterprise Bug Fixes**, focusing on **phantom order elimination for failed checkouts**, **bi-directional multi-warehouse inventory synchronization**, and **automated database cleanup & test suite validation**.

---

## 📌 Architecture & Synchronization Flow (Day 13)

```mermaid
flowchart TD
    subgraph "1. Checkout Resilience & Failed Order Guard"
        A["Customer Initiates Checkout"] --> B{"Razorpay Payment Result"}
        B -->|"Payment Dismissed / Failed"| C["Zero Orders Created in DB<br/>Clean Customer & Admin History"]
        B -->|"Payment Verified"| D["Create Valid Order (ORD-XXXXXX)<br/>Status: CONFIRMED, Payment: PAID"]
    end

    subgraph "2. Multi-Warehouse Stock Synchronizer"
        E["Vendor/Admin Stock Update"] --> F["Update Product Global Stock"]
        F --> G["Proportional Auto-Distribution Across 4 Regional Hubs<br/>(Kolkata, Mumbai, Delhi, Bangalore)"]
        G --> H["Live Aggregated Available Stock Computed on Read<br/>sum(inventory.quantity - allocated)"]
    end
```

---

## 📌 Key Problems Resolved & Enhancements (Day 13)

### 1. Elimination of Phantom Orders on Failed / Dismissed Checkouts
* **The Problem**: When a customer dismissed the Razorpay modal or encountered a payment failure, duplicate webhook/event handlers (`payment.failed` and `modal.ondismiss`) fired simultaneously, causing the backend to generate multiple phantom orders (e.g. `ORD-FAIL-603250`) with status `CANCELLED` and payment status `FAILED`, polluting the customer's order history and the Admin Order Monitoring dashboard.
* **The Fix**:
  - **Non-Persisted Diagnostics**: Modified `PaymentService.recordFailedPayment` to purely log diagnostic events without creating or saving any `Order` or `OrderItem` entities in PostgreSQL.
  - **Automated Database Cleanup**: Added a startup `@PostConstruct` cleanup routine in `PaymentService` that automatically detects and purges legacy `ORD-FAIL-*` records and their child order items from the database.
  - **Controller-Level Guards**: Implemented defensive filtering in `CustomerController.getCustomerOrders`, `CustomerController.getAllOrders`, `AdminController.getPaymentMonitoringOverview`, and `VendorController.getVendorOrders` to guarantee that only legitimate orders are processed and displayed.
  - **Frontend Event Handling**: Streamlined checkout event handlers in `CustomerDashboard.jsx` and `HomeDashboard.jsx` to show non-intrusive toast notifications and maintain the payment state for effortless retry without triggering order creation.

### 2. Live Bi-Directional Multi-Warehouse Stock Synchronization
* **The Problem**: A 2:1 discrepancy existed where the Vendor Product Table showed static, stale product stock values (e.g. 800 units) while the Admin Multi-Warehouse Distribution table showed the true physical inventory sum across 4 regional hubs (400 × 4 = 1,600 units). Manual stock updates from vendors did not distribute stock into warehouse inventories.
* **The Fix**:
  - **Dynamic Stock Computation on Read**: Updated `populateRatings` in `ProductController` and `populateProductRatings` in `AdminController` to dynamically compute `product.stock` as the live sum of available stock (`sum(quantity - allocated)`) across all warehouses.
  - **Startup Reconciler**: Added automated synchronization in `ProductController.initProducts()` and `DataLoader.java` to reconcile catalog stock with physical warehouse inventory on server boot.
  - **Bi-Directional Stock Updates**: Enhanced `updateProductStock` (`PUT /api/products/{id}/stock`), `addProduct`, and `updateProduct` in `ProductController` so that any stock update from vendors or admins is automatically distributed across the regional fulfillment hubs (Kolkata, Mumbai, Delhi, Bangalore).

### 3. Automated Test Suite Verification
* Executed full unit and integration test suite (`CommissionCalculationTests.java` and `BackendApplicationTests.java`).
* Verified 100% test pass rate (6/6 passing) covering marketplace commission calculations (10% platform fee, 90% vendor payout), COD settlements on delivery, and refund deductions.

---

## 📂 Project Structure Updates (Day 13)

```text
ShopStack/
├── backend/
│   └── src/main/java/com/shopstack/backend/
│       ├── config/
│       │   └── DataLoader.java                # Global stock synchronization with warehouse inventory
│       ├── controller/
│       │   ├── ProductController.java         # Dynamic stock calculation & bi-directional warehouse sync
│       │   ├── CustomerController.java        # Excluded failed/phantom orders from customer history & admin
│       │   ├── AdminController.java           # Dynamic product stock & filtered payment monitoring
│       │   ├── VendorController.java          # Clean vendor order listings & accurate low-stock analytics
│       │   └── PaymentController.java         # Non-persisting failure recording
│       └── service/
│           └── PaymentService.java            # Startup cleanup for failed orders & non-persisting failure handler
│
├── frontend/
│   └── src/
│       └── components/
│           ├── CustomerDashboard.jsx          # Clean Razorpay dismiss/failure handling & filtered order history
│           ├── HomeDashboard.jsx              # Clean checkout cancellation handling
│           └── AdminDashboard.jsx             # Clean Order Monitoring table without failed attempts
│
└── Documentation Artifacts/
    ├── FAILED_ORDERS_FIX_DOCUMENTATION.txt     # In-depth problem statement and fix guide for failed checkouts
    └── PRODUCT_STOCK_SYNC_FIX_DOCUMENTATION.txt# In-depth problem statement and fix guide for stock synchronization
```

Related Code Files:
- [`ProductController.java`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/backend/src/main/java/com/shopstack/backend/controller/ProductController.java)
- [`PaymentService.java`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/backend/src/main/java/com/shopstack/backend/service/PaymentService.java)
- [`CustomerController.java`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/backend/src/main/java/com/shopstack/backend/controller/CustomerController.java)
- [`AdminController.java`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/backend/src/main/java/com/shopstack/backend/controller/AdminController.java)
- [`DataLoader.java`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/backend/src/main/java/com/shopstack/backend/config/DataLoader.java)
- [`CustomerDashboard.jsx`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/frontend/src/components/CustomerDashboard.jsx)
- [`AdminDashboard.jsx`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/frontend/src/components/AdminDashboard.jsx)

---

## 📡 API Endpoints Enhanced (Day 13)

### Stock & Order Integrity Endpoints
Method | Endpoint | Description | Enhancement / Behavior
------ | -------- | ----------- | ----------------------
GET | `/api/products` | Fetch all approved products | Dynamically returns live available stock aggregated across all 4 fulfillment hubs
PUT | `/api/products/{id}/stock` | Vendor quick stock update | Proportionally synchronizes and updates inventory across all 4 regional warehouses
GET | `/api/customer/{id}/orders` | Customer order history | Strictly returns confirmed/placed orders, excluding failed/phantom checkouts
GET | `/api/customer/orders/all` | Admin / Warehouse orders | Returns valid platform orders, excluding failed payment attempts
POST | `/api/payment/record-failed` | Diagnostic checkout failure logging | Logs event diagnostics without creating or saving `Order` entities

---

## 🚦 Verification Checklist (Day 13)

### 1. Checkout Failure & Dismissal Integrity
1. Initiate a Razorpay payment as a Customer and intentionally dismiss or close the modal.
2. Verify that a `"Payment Cancelled"` toast appears and the checkout screen remains ready for retry.
3. Open **Customer Order History** and confirm **0** canceled/failed orders appear.
4. Log in as Admin, open **Order Monitoring**, and verify **0** failed phantom orders are listed.
5. Complete a successful retry payment and verify that exactly **1** confirmed order is registered.

### 2. Stock Synchronization Across Catalog & Warehouses
1. Open the **Vendor Dashboard** and note the stock for any product (e.g. iPhone 17 Pro Max showing `1,600 IN STOCK`).
2. Open **Admin Dashboard → Warehouses & Allocation → Vendor Product Stock Distribution Across Warehouses**.
3. Confirm that the total physical stock and available units in all hubs (400 + 400 + 400 + 400 = 1,600) match the vendor catalog stock exactly.
4. Use the quick stock `+` / `-` buttons on the Vendor Dashboard to increment stock by 1, and verify both views update in real-time.

---

# 📱 ShopStack — Day 14: Ergonomic Mobile Navigation, Responsive Layout Alignment, Isolated "Buy Now" Checkout & Cross-Browser Alignment

This milestone delivers **Full Multi-Device UI Responsiveness** (Desktop, Tablet, Mobile), an **Ergonomic Mobile Bottom Navigation Dock**, a **Single-Row Streamlined Mobile Top App Bar with Compact Search & Notifications**, **Centralized Marketplace Notification Center**, **Responsive Grid & Pipeline Distribution Tracker Alignment Fixes**, **Cross-Browser Custom `<select>` & `<option>` Dropdown Styling**, **Centralized Account Controls & Session Reassurance Dialog**, an **Isolated Direct "Buy Now" Checkout Engine**, **Cart Drawer Stability Fixes**, **Mobile Wi-Fi Cross-Device Media Delivery**, **Automated Backend Commission Calculation Unit Testing**, and **Standardized Enterprise Error Handling**.

---

## 📌 Architecture & Interaction Flows (Day 14)

```mermaid
flowchart TD
    subgraph "1. Mobile Ergonomic Navigation & Notification Architecture"
        A["Mobile User Viewport (<= 768px)"] --> B["Single-Row Top App Bar<br/>[Logo] + [Compact Search (36px)] + [Live Notif Bell]"]
        A --> C["Fixed Bottom Navigation Dock (MobileBottomNav)<br/>[Home] + [Role Action / Orders] + [Cart (Live Badge)] + [Profile]"]
        B --> D["Centralized Notification Dropdown<br/>- Admin: Pending Product Reviews<br/>- Customer: Live Order Status Tracking"]
        C --> E["One-Thumb Ergonomic Role Switching<br/>(Customer, Vendor, Admin, Warehouse Staff)"]
    end

    subgraph "2. Isolated Direct 'Buy Now' Checkout vs Persistent Cart"
        F["Shopper Clicks 'Buy Now'"] --> G["handleBuyNow(product)"]
        G --> H["Set checkoutMode = 'buynow'<br/>activeProduct = [Single Item]"]
        H --> I["Direct Checkout Overlay<br/>(Persistent Cart State Untouched)"]
        I -->|"User Cancels Checkout"| J["Reset checkoutMode<br/>(Cart Items Preserved 100%)"]
        I -->|"User Confirms Order"| K["Process Single Order Placement<br/>(Cart Items Retained for Future Checkout)"]
    end

    subgraph "3. Responsive Grids & Cross-Browser Select Alignment"
        L["Pipeline Distribution Tracker & Analytics"] --> M["Desktop: 4-Column Grid (repeat(4, 1fr))<br/>Tablet / Mobile: 2x2 Balanced Grid (repeat(2, 1fr))"]
        N["Browser Native Select Dropdown"] --> O["appearance: none + Custom Embedded SVG Chevron<br/>Theme-Aware Styled <option> (Dark: #131c31, Light: #ffffff)<br/>Consistent Width, Padding & Zero Popover Clipping"]
    end

    subgraph "4. Universal Session Guard & Error Normalization"
        P["User Clicks 'Log Out'"] --> Q["Show Reassurance Confirmation Dialog<br/>(Are you sure you want to log out?)"]
        Q -->|"Confirm Logout"| R["Clear Auth State & Redirect to /login"]
        S["Backend Exception"] --> T["GlobalExceptionHandler (@RestControllerAdvice)"]
        T --> U["ApiErrorResponse JSON -> extractErrorMessage() Toast Normalizer"]
    end
```

---

## 📌 Key Capabilities & Enhancements (Day 14)

### 1. Ergonomic Mobile Bottom Navigation Dock (`MobileBottomNav.jsx`)
* **Docked Bottom Navigation**:
  - Implemented a fixed, frosted glassmorphism mobile bottom navigation bar docked to the bottom of the viewport (`z-index: 600`, `backdrop-filter: blur(20px)`).
  - Provides quick thumb access across mobile devices:
    - **Home**: Instant return to the storefront catalog.
    - **Role Dynamic Panel**: Context-aware button displaying **Admin Console** (for Administrators), **Seller Console** (for Vendors), **Warehouse Hub** (for Warehouse Staff), or **My Orders** (for Customers).
    - **Cart**: Direct cart checkout trigger with animated live item count badge.
    - **Profile**: Direct navigation to user profile, saved addresses, and orders.
  - Safe-area inset padding (`env(safe-area-inset-bottom)`) prevents collision with hardware gesture bars on modern iOS and Android devices.

### 2. Streamlined Single-Row Mobile Top App Bar
* **Single-Row Layout**:
  - Transformed the top navbar on mobile (`<= 768px`) into a single, cohesive horizontal row containing:
    - **ShopStack Gradient Logo** (`font-size: 18px`).
    - **Compact Search Input** (`height: 36px`, `max-width: 210px`, reduced padding and clean placeholder).
    - **Live Notification Bell** with pulsing badge and responsive overlay dropdown.
* **Header Cleanup**:
  - Removed duplicate theme toggles from the mobile storefront header for a clutter-free, professional shopping experience.

### 3. Centralized Marketplace Notification Center
* **Single Hub for Alerts**:
  - Centralized all notification badges and dropdowns inside `HomeDashboard.jsx` (accessible across desktop and mobile headers).
  - Displays live alerts for:
    - **Admin / Staff**: Pending vendor product submission review counts with direct navigation to the approval drawer.
    - **Customer**: Real-time active order status tracking (`PROCESSING`, `PLACED`, `OUT_FOR_DELIVERY`) with one-tap order inspection.
  - Cleaned up duplicate notification bell buttons from `AdminDashboard.jsx`, `VendorDashboard.jsx`, and `WarehouseDashboard.jsx` for clean visual hierarchy.

### 4. Responsive Grid & Pipeline Distribution Tracker Fix
* **Pipeline Distribution Tracker Alignment**:
  - Fixed mobile card overflow in the **Warehouse Logistics Hub** (`WarehouseDashboard.jsx`) where 4 pipeline steps previously extended past the right screen boundary.
  - Replaced inline fixed styles with `.pipeline-tracker-grid` and `.pipeline-tracker-item`.
  - On desktop (`> 868px`): Renders as 4 columns in a single row.
  - On mobile & tablets (`<= 868px` and `<= 480px`): Automatically rearranges into a balanced **2×2 grid** (`repeat(2, 1fr)`), keeping all 4 steps (`1. STOCK ALLOCATED`, `2. PRODUCT PICKED`, `3. ORDER PACKED`, `4. READY FOR SHIPMENT`) neatly inside the screen boundary.
* **Universal Responsive Utility Classes**:
  - `.responsive-kpi-grid`: Auto-fits on desktop, 2 columns on tablet, 1 column on mobile.
  - `.responsive-split-grid`: 1.2fr/0.8fr side-by-side on desktop, stacks to 1 column on mobile.
  - `.responsive-lifecycle-grid`: 4 columns on desktop, 2×2 on mobile.
  - `.metric-card`, `.metric-label`, `.metric-value`: Scaled typography and padding for high-density mobile screens.

### 5. Cross-Browser Custom `<select>` & `<option>` Dropdown Styling
* **Elimination of OS / Popover Clipping**:
  - Resolved browser-native select popover distortion where `<option>` lists extended past container edges with misaligned system backgrounds.
  - Applied `appearance: none`, `-webkit-appearance: none`, and `-moz-appearance: none` with custom inline SVG chevrons.
  - Set `width: 100%`, `max-width: 100%`, and `box-sizing: border-box`.
* **Theme-Aware `<option>` Styling**:
  - Explicitly styled `<option>` elements with dark theme (`#131c31`) and light theme (`#ffffff`) background colors, `#f8fafc` / `#0f172a` text, left-alignment (`text-align: left`), and `#6366f1` indigo active selection highlight.

### 6. Isolated Direct "Buy Now" Checkout Engine
* **Dedicated Single-Product Flow**:
  - Prominent **"⚡ Buy Now"** button on product cards and details modals.
  - Triggers direct checkout in `checkoutMode = 'buynow'` containing strictly the chosen product.
* **Persistent Cart Immunity**:
  - Does **not** mutate or clear persistent cart items.
  - Canceling or completing a Buy Now order leaves existing cart items intact for future purchases.

### 7. Cart Drawer Stability & Strikethrough Pricing
* **Zero-Crash Drawer**:
  - Fixed `hasDiscount` scope error in `HomeDashboard.jsx` that caused blank screen crashes on opening the cart drawer.
  - Displays original price strikethroughs, discount percentages, and real-time quantity steppers.

### 8. Cross-Device Wi-Fi Media Streaming & Proxy Configuration
* **Mobile Image Streaming**:
  - Implemented [`imageHelper.js`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/frontend/src/utils/imageHelper.js) (`formatImageUrl`) converting absolute backend URLs to relative `/uploads/...` paths.
  - Configured Vite reverse proxy in [`vite.config.js`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/frontend/vite.config.js) to forward `/uploads` and `/api` to the Spring Boot backend (`http://127.0.0.1:8080`).

### 9. Standardized Backend Exception Interceptor & Frontend Normalizer
* **Backend Error Advice**:
  - Implemented [`GlobalExceptionHandler.java`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/backend/src/main/java/com/shopstack/backend/config/GlobalExceptionHandler.java) (`@RestControllerAdvice`) returning structured `ApiErrorResponse` JSON.
* **Frontend Error Normalizer**:
  - Implemented [`errorHandler.js`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/frontend/src/utils/errorHandler.js) (`extractErrorMessage`) converting API errors into user-friendly toast notifications.

### 10. Automated Backend Commission Calculation Unit Test Suite
* **JUnit 5 Suite** ([`CommissionCalculationTests.java`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/backend/src/test/java/com/shopstack/backend/CommissionCalculationTests.java)):
  - Validates 10% platform commission, dynamic promotional rate simulation, automated COD settlement generation, and refund deductions.

---

## 📂 Project Structure Updates (Day 14)

```text
ShopStack/
├── backend/
│   ├── src/main/java/com/shopstack/backend/
│   │   ├── config/
│   │   │   ├── GlobalExceptionHandler.java    # @RestControllerAdvice standardized JSON error interceptor
│   │   │   ├── SecurityConfig.java            # Permissive CORS & preflight filter configuration
│   │   │   └── WebConfig.java                 # Universal origin mapper for local and Wi-Fi clients
│   │   ├── controller/
│   │   │   └── CommissionController.java      # Financial commission calculation & simulation APIs
│   │   └── service/
│   │       └── PaymentService.java            # Automated settlement creation & refund reversal logic
│   └── src/test/java/com/shopstack/backend/
│       └── CommissionCalculationTests.java    # JUnit 5 suite for commission, payout & refund tests
│
├── frontend/
│   ├── vite.config.js                         # Reverse proxy for /api and /uploads with header rewriting
│   └── src/
│       ├── App.jsx                            # Global session reassurance logout modal & route guards
│       ├── index.css                          # Universal responsive layout, pipeline 2x2 grid & custom select styles
│       ├── utils/
│       │   ├── errorHandler.js                # extractErrorMessage universal error normalizer
│       │   └── imageHelper.js                 # formatImageUrl cross-device media URL adapter
│       └── components/
│           ├── MobileBottomNav.jsx            # Fixed ergonomic bottom dock (Home, Orders/Admin/Vendor/WH, Cart, Profile)
│           ├── HomeDashboard.jsx              # Single-row mobile app bar, compact search, centralized notifications
│           ├── CustomerDashboard.jsx          # Mobile touch pills, responsive stepper & buy now checkout
│           ├── VendorDashboard.jsx            # Streamlined header, clean merchant controls
│           ├── WarehouseDashboard.jsx         # Responsive pipeline distribution tracker (2x2 grid on mobile)
│           ├── AdminDashboard.jsx             # Responsive KPI grids, split distribution charts
│           ├── Login.jsx                      # Form validation & normalized auth error handling
│           └── Register.jsx                   # Role domain enforcement (@admin, @staff) & password rules
│
└── Documentation Artifacts/
    └── UI_RESPONSIVENESS_AND_ERROR_HANDLING_DOCUMENTATION.txt
```

Related Code Files:
- [`MobileBottomNav.jsx`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/frontend/src/components/MobileBottomNav.jsx)
- [`HomeDashboard.jsx`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/frontend/src/components/HomeDashboard.jsx)
- [`WarehouseDashboard.jsx`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/frontend/src/components/WarehouseDashboard.jsx)
- [`CustomerDashboard.jsx`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/frontend/src/components/CustomerDashboard.jsx)
- [`AdminDashboard.jsx`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/frontend/src/components/AdminDashboard.jsx)
- [`App.jsx`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/frontend/src/App.jsx)
- [`CommissionCalculationTests.java`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/backend/src/test/java/com/shopstack/backend/CommissionCalculationTests.java)
- [`GlobalExceptionHandler.java`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/backend/src/main/java/com/shopstack/backend/config/GlobalExceptionHandler.java)
- [`errorHandler.js`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/frontend/src/utils/errorHandler.js)
- [`imageHelper.js`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/frontend/src/utils/imageHelper.js)
- [`index.css`](file:///C:/Users/ASUS/Documents/GitHub/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform/frontend/src/index.css)

---

## 📡 API Endpoints Enhanced (Day 14)

### Commission & Financial Simulation Endpoints
Method | Endpoint | Description | Payload Format / Response Model
------ | -------- | ----------- | ------------------------------
GET | `/api/commission/calculate` | Calculates splits on-the-fly for gross `amount` and optional `rate` | Returns `{"grossAmount", "rate", "commissionAmount", "netVendorPayout"}`
GET | `/api/commission/records` | Retrieves commission/settlement records by `vendorId` or `orderId` | Returns List of `Settlement`
GET | `/api/admin/dashboard-summary` | Marketplace KPI summary with net refunds and commission deducted | Returns `totalSalesVolume`, `totalCommission`, `totalPayouts`

---

## 🚦 Verification Checklist (Day 14)

### 1. Mobile Bottom Navigation Dock & Single-Row Top App Bar
1. Open the application on a mobile viewport (375px–480px width).
2. Verify the **Mobile Bottom Navigation Dock** appears fixed at the bottom with 4 actions:
   - Tap **Home** → Returns to catalog.
   - Tap **Orders / Admin / Seller / Warehouse** → Navigates directly to the role dashboard.
   - Tap **Cart** → Opens cart drawer.
   - Tap **Profile** → Opens customer profile & addresses.
3. Verify the top header renders in a **single horizontal line**: Logo + Compact Search Input (`height: 36px`) + Live Notification Bell.

### 2. Pipeline Distribution Tracker 2×2 Grid on Mobile
1. Log in as Warehouse Staff or open the **Warehouse Dashboard**.
2. Resize viewport to mobile width (`<= 768px` or `400px`).
3. Scroll down to **Pipeline Distribution Tracker**:
   - Verify all 4 status cards (`1. STOCK ALLOCATED`, `2. PRODUCT PICKED`, `3. ORDER PACKED`, `4. READY FOR SHIPMENT`) display as a neat **2×2 grid**.
   - Verify zero horizontal overflow or card cutoff.

### 3. Cross-Browser Dropdown `<select>` & `<option>` Alignment
1. In **Home Dashboard**, tap the **Product Category** or **Minimum Rating** dropdown.
2. Verify the options list opens with custom styling, left alignment, dark background (`#131c31`), and no OS popover clipping or text overflow.
3. Switch theme to Light Mode → Verify select background is white (`#ffffff`) with dark text (`#0f172a`).

### 4. Isolated "Buy Now" Checkout
1. Add Item A to your shopping cart (Cart badge shows **1**).
2. On any catalog product card, click **"⚡ Buy Now"** on Item B.
3. Verify the checkout screen opens with **only Item B**.
4. Cancel checkout → Open cart and verify Item A is still in the cart.
5. Click **"⚡ Buy Now"** on Item B again and complete order → Verify Item A remains in your cart.

### 5. Automated Commission Test Suite
1. Run backend unit tests:
   ```bash
   mvn test -Dtest=CommissionCalculationTests
   ```
2. Verify that all commission calculation, settlement generation, and refund reversal tests pass with `BUILD SUCCESS`.

---

# 📬 ShopStack — Day 15: Real-Time Customer Notification & Transactional Email Module

This milestone delivers an enterprise-grade, asynchronous, event-driven **Transactional Notification & Email Module** for ShopStack built with **Spring Boot**, **JavaMailSender**, **Thymeleaf HTML templates**, and **Spring Events (`@EventListener` + `@Async`)**.

---

## 📌 Architecture & Interaction Flows (Day 15)

```mermaid
flowchart TD
    subgraph "1. Business Domain Events (Decoupled Publishing)"
        A1["Customer Checkout / Payment Verified"] -->|"publishEvent"| B1["OrderPlacedEvent<br/>PaymentSuccessEvent"]
        A2["Payment Failure / Dismissal"] -->|"publishEvent"| B2["PaymentFailedEvent"]
        A3["Warehouse / Vendor Dispatch (SHIPPED)"] -->|"publishEvent"| B3["OrderShippedEvent"]
        A4["Final Delivery Handover (DELIVERED)"] -->|"publishEvent"| B4["OrderDeliveredEvent"]
        A5["Return Approved & QC Passed (REFUND)"] -->|"publishEvent"| B5["RefundCompletedEvent"]
    end

    subgraph "2. Asynchronous Event Dispatcher"
        B1 & B2 & B3 & B4 & B5 --> C["NotificationEventListener<br/>(@EventListener + @Async('emailTaskExecutor'))"]
        C --> D["Dedicated ThreadPoolTaskExecutor<br/>(Core: 2, Max: 5, Queue: 50, Prefix: ShopStack-Mail-)"]
    end

    subgraph "3. Notification Context & Template Engine"
        D --> E["NotificationService<br/>- Resolves Customer User & Recipient Email<br/>- Formats Dates, Currency & Line Items"]
        E --> F["EmailService (TemplateEngine)<br/>- Thymeleaf HTML Template Compilation<br/>- Injects Model Context Attributes"]
    end

    subgraph "4. Resilient SMTP Transport & Delivery"
        F --> G["JavaMailSender (MimeMessageHelper)<br/>- SMTP Host: smtp.gmail.com:587 (STARTTLS)<br/>- From: ShopStack Support <support@shopstack.com>"]
        G --> H["Customer Inbox (Responsive HTML Email)"]
        G -.->|"SMTP Failure / Timeout"| I["Error Isolation<br/>(Logs error, NEVER rolls back DB transaction)"]
    end
```

---

## 📌 Key Capabilities & Notification Events (Day 15)

### 1. Decoupled, Non-Blocking Event-Driven Architecture
* **Total Business Logic Isolation**: Controllers and services (`PaymentService`, `WarehouseService`, `VendorController`) do not contain mail transport code. They publish lightweight domain events via `ApplicationEventPublisher`.
* **Asynchronous Thread Pool (`AsyncConfig.java`)**: Configured a dedicated `ThreadPoolTaskExecutor` bean (`emailTaskExecutor`) with custom thread naming (`ShopStack-Mail-1`, `ShopStack-Mail-2`). Email transmission runs entirely in the background and will never slow down customer checkout or API response times.
* **Fault-Tolerant & Transaction-Safe**: `EmailService` isolates all `MailException` and `MessagingException` instances. If SMTP credentials or network connectivity fail, the error is logged and the primary database transaction (order creation, inventory deduction, payment capture) completes successfully.

### 2. Six Real-Time Customer Lifecycle Email Notifications

| Notification | Trigger Event | Source Trigger | Thymeleaf Template | Injected Variables |
| :--- | :--- | :--- | :--- | :--- |
| **1. Order Placed** | `OrderPlacedEvent` | `PaymentService.placeVerifiedOrder` / `CustomerController.placeOrder` | `email/order-placed.html` | Order ID, items table, quantities, unit prices, discounts, total amount, shipping address |
| **2. Payment Successful** | `PaymentSuccessEvent` | `PaymentService.placeVerifiedOrder` | `email/payment-success.html` | Order ID, Razorpay Payment ID, paid amount, payment status, payment method, timestamp |
| **3. Payment Failed** | `PaymentFailedEvent` | `PaymentService.recordFailedPayment` | `email/payment-failed.html` | Order ID, Razorpay Order ID, attempted amount, failure reason, timestamp |
| **4. Order Shipped** | `OrderShippedEvent` | `WarehouseService.updateAllocationStatus` / `VendorController.updateOrderStatus` | `email/order-shipped.html` | Order ID, carrier name, tracking number, dispatched timestamp, shipping address |
| **5. Order Delivered** | `OrderDeliveredEvent` | `WarehouseService.updateAllocationStatus` / `VendorController.updateOrderStatus` | `email/order-delivered.html` | Order ID, delivered timestamp, recipient address, customer feedback & review callout |
| **6. Refund Completed** | `RefundCompletedEvent` | `PaymentService.resolveReturnRequest` / `PaymentService.approveAndExecuteRefund` / `PaymentService.processRefund` | `email/refund-completed.html` | Order ID, refund amount, refund reference ID, return reason category, processed date |

### 3. Premium Responsive Thymeleaf HTML Templates
* **Design Standards**: Crafted with modern typography, subtle gradients, high-contrast badges, pricing highlights, and responsive tables.
* **Branded Footers**: Includes copyright notices, support contact links, and marketplace disclaimers.

---

## 📁 Directory & File Structure Updates (Day 15)

```text
ShopStack-Enterprise-Multi-Vendor-E-Commerce-Platform/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/shopstack/backend/
│   │   │   │   ├── config/
│   │   │   │   │   └── AsyncConfig.java             # ThreadPoolTaskExecutor bean config (emailTaskExecutor)
│   │   │   │   ├── event/
│   │   │   │   │   ├── OrderPlacedEvent.java        # Fired when customer successfully places an order
│   │   │   │   │   ├── PaymentSuccessEvent.java     # Fired when gateway verifies payment capture
│   │   │   │   │   ├── PaymentFailedEvent.java      # Fired when payment fails or user dismisses modal
│   │   │   │   │   ├── OrderShippedEvent.java       # Fired when warehouse/vendor marks status SHIPPED
│   │   │   │   │   ├── OrderDeliveredEvent.java     # Fired when package is marked DELIVERED
│   │   │   │   │   └── RefundCompletedEvent.java    # Fired when return/refund is resolved & disbursed
│   │   │   │   ├── listener/
│   │   │   │   │   └── NotificationEventListener.java # @Async @EventListener handler for all 6 domain events
│   │   │   │   └── service/
│   │   │   │       ├── EmailService.java            # JavaMailSender + Thymeleaf renderer + error isolation
│   │   │   │       ├── NotificationService.java     # Recipient resolver & template context builder
│   │   │   │       ├── PaymentService.java          # Event publisher for orders, payments & return refunds
│   │   │   │       └── WarehouseService.java        # Event publisher for dispatch & delivery transitions
│   │   │   └── resources/
│   │   │       ├── application.properties           # SMTP server parameters & Thymeleaf config
│   │   │       └── templates/email/
│   │   │           ├── order-placed.html            # Order confirmation template with items breakdown
│   │   │           ├── payment-success.html         # Payment receipt template with gateway reference
│   │   │           ├── payment-failed.html          # Payment failure advisory with retry callout
│   │   │           ├── order-shipped.html           # Dispatch template with tracking & courier details
│   │   │           ├── order-delivered.html         # Delivery celebration template with review prompt
│   │   │           └── refund-completed.html        # Refund credit confirmation template
│   │   └── test/
│   │       └── java/com/shopstack/backend/service/
│   │           ├── EmailServiceTest.java            # Unit tests for template rendering & SMTP isolation
│   │           └── OrderEventPublishingTest.java    # Integration tests for domain event publication
│   └── pom.xml                                      # Added spring-boot-starter-mail & thymeleaf
```

Related Code Files:
- [`AsyncConfig.java`](file:///backend/src/main/java/com/shopstack/backend/config/AsyncConfig.java)
- [`EmailService.java`](file:///backend/src/main/java/com/shopstack/backend/service/EmailService.java)
- [`NotificationService.java`](file:///backend/src/main/java/com/shopstack/backend/service/NotificationService.java)
- [`NotificationEventListener.java`](file:///backend/src/main/java/com/shopstack/backend/listener/NotificationEventListener.java)
- [`OrderPlacedEvent.java`](file:///backend/src/main/java/com/shopstack/backend/event/OrderPlacedEvent.java)
- [`PaymentSuccessEvent.java`](file:///backend/src/main/java/com/shopstack/backend/event/PaymentSuccessEvent.java)
- [`PaymentFailedEvent.java`](file:///backend/src/main/java/com/shopstack/backend/event/PaymentFailedEvent.java)
- [`OrderShippedEvent.java`](file:///backend/src/main/java/com/shopstack/backend/event/OrderShippedEvent.java)
- [`OrderDeliveredEvent.java`](file:///backend/src/main/java/com/shopstack/backend/event/OrderDeliveredEvent.java)
- [`RefundCompletedEvent.java`](file:///backend/src/main/java/com/shopstack/backend/event/RefundCompletedEvent.java)
- [`order-placed.html`](file:///backend/src/main/resources/templates/email/order-placed.html)
- [`payment-success.html`](file:///backend/src/main/resources/templates/email/payment-success.html)
- [`payment-failed.html`](file:///backend/src/main/resources/templates/email/payment-failed.html)
- [`order-shipped.html`](file:///backend/src/main/resources/templates/email/order-shipped.html)
- [`order-delivered.html`](file:///backend/src/main/resources/templates/email/order-delivered.html)
- [`refund-completed.html`](file:///backend/src/main/resources/templates/email/refund-completed.html)
- [`EmailServiceTest.java`](file:///backend/src/test/java/com/shopstack/backend/service/EmailServiceTest.java)
- [`OrderEventPublishingTest.java`](file:///backend/src/test/java/com/shopstack/backend/service/OrderEventPublishingTest.java)

---

## ⚙️ Environment Variables & Mail Configuration

ShopStack dynamically injects SMTP credentials from environment variables with safe development placeholders:

```properties
# ==========================================
# Email Notification Configuration (JavaMailSender)
# ==========================================
spring.mail.host=${MAIL_HOST:smtp.gmail.com}
spring.mail.port=${MAIL_PORT:587}
spring.mail.username=${MAIL_USERNAME:your-email@gmail.com}
spring.mail.password=${MAIL_PASSWORD:your-gmail-app-password}
spring.mail.protocol=smtp
spring.mail.default-encoding=UTF-8

# JavaMail SMTP Properties
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
spring.mail.properties.mail.smtp.connectiontimeout=5000
spring.mail.properties.mail.smtp.timeout=5000
spring.mail.properties.mail.smtp.writetimeout=5000

# Email Sender Meta
shopstack.mail.from-email=${MAIL_FROM:support@shopstack.com}
shopstack.mail.from-name=ShopStack Support

# Thymeleaf Template Engine Configuration
spring.thymeleaf.prefix=classpath:/templates/
spring.thymeleaf.suffix=.html
spring.thymeleaf.mode=HTML
spring.thymeleaf.encoding=UTF-8
spring.thymeleaf.cache=false
```

### Setting Up Gmail SMTP App Password Locally
1. Enable **2-Step Verification** on your Google Account (`myaccount.google.com/security`).
2. Go to **Security → 2-Step Verification → App Passwords**.
3. Create an app password named `ShopStack` and copy the 16-character code.
4. Set the environment variables in your local environment or `.env` file:
   ```powershell
   # Windows PowerShell
   $env:MAIL_HOST="smtp.gmail.com"
   $env:MAIL_PORT="587"
   $env:MAIL_USERNAME="your-email@gmail.com"
   $env:MAIL_PASSWORD="your-16-char-app-password"
   $env:MAIL_FROM="support@shopstack.com"
   ```

---

## 🧪 Automated Testing

Run the automated test suite for the Notification module:

```powershell
# Run Email Service unit tests (verifies HTML compilation & transport error isolation)
mvn test -Dtest=EmailServiceTest

# Run Event Publishing integration tests (verifies domain event triggers across services)
mvn test -Dtest=OrderEventPublishingTest

# Run all project test suites (12 tests)
mvn test
```

---

## 🚦 Verification Checklist (Day 15)

### 1. Order Confirmation & Payment Success Email
1. Log in as a Customer and add an item to your cart.
2. Complete checkout via Razorpay (Test Mode) or Cash on Delivery.
3. Check the customer's registered email inbox:
   - Verify **"Order Confirmation - #ORD-XXXXXX | ShopStack"** arrives with itemized product table, pricing breakdown, and delivery address.
   - For Razorpay payments, verify **"Payment Confirmed for Order #ORD-XXXXXX | ShopStack"** arrives with the transaction reference ID.

### 2. Payment Failure Advisory Email
1. Initiate checkout via Razorpay and dismiss/close the payment window or simulate a failure.
2. Verify an email with subject **"Payment Action Required - Order #ORD-XXXXXX | ShopStack"** is delivered, explaining the issue and offering a retry option.

### 3. Order Shipped & Out for Delivery Alerts
1. In the **Warehouse Dashboard** or **Vendor Console**, advance the order to `SHIPPED`.
2. Verify **"Your Order #ORD-XXXXXX Has Shipped! 🚚 | ShopStack"** is delivered with courier tracking number and dispatched timestamp.

### 4. Order Delivered Notification
1. Advance the order status to `DELIVERED`.
2. Verify **"Order Delivered - #ORD-XXXXXX 🎉 | ShopStack"** is received by the customer with a prompt to review the purchase.

### 5. Return Resolution & Refund Notification
1. Submit a return request as a Customer.
2. Perform warehouse receipt & pass Quality Control (QC).
3. In the Admin Console, resolve the return by selecting **"Disburse Refund"**.
4. Verify **"Refund Processed for Order #ORD-XXXXXX 💸 | ShopStack"** arrives with the refund reference ID and credited amount.

---

# 🐳 ShopStack — Day 16: Docker Containerization, AWS Cloud Deployment & GitHub Actions CI/CD Pipeline

This milestone delivers production **Multi-Stage Docker Containerization**, live **AWS EC2 Cloud Deployment**, **Automated GitHub Actions CI/CD Push-to-Deploy**, **Nginx Reverse Proxy Image & API Streaming**, and **PostgreSQL Database Cloud Synchronization** for the entire ShopStack platform.

---

## 📌 Cloud Architecture & CI/CD Deployment Topology (Day 16)

```mermaid
flowchart TD
    subgraph "1. Developer & Source Control"
        Dev["Developer commits changes<br/>git push origin main"] --> GHA["GitHub Actions Workflow<br/>.github/workflows/deploy.yml"]
    end

    subgraph "2. Automated CI/CD Pipeline (Ubuntu Runner)"
        GHA -->|"1. Checkout Repository"| GH1["actions/checkout@v4"]
        GH1 -->|"2. Validate Secrets"| GH2["Check EC2_HOST, EC2_USER, EC2_SSH_KEY"]
        GH2 -->|"3. Native Rsync Sync"| GH3["rsync over OpenSSH (Port 22)<br/>Fast Delta Sync (Excludes .git, .env, *.pem)"]
        GH3 -->|"4. Remote SSH Execution"| GH4["Docker Compose Orchestration<br/>Builder Prune + Compose Build + Up -d"]
    end

    subgraph "3. AWS EC2 Cloud Host (Ubuntu 24.04 LTS — 13.48.47.35)"
        GH4 --> Docker["Docker Compose Orchestration (shopstack-network)"]
        
        subgraph "Containerized Application Stack"
            Frontend["shopstack-frontend (Port 80)<br/>- Nginx Alpine Web Server<br/>- React 19 Vite Production Bundle<br/>- SPA Client-Side Routing<br/>- ^~ /uploads/ & ^~ /api/ Reverse Proxy"]
            
            Backend["shopstack-backend (Port 8080)<br/>- Spring Boot 4.x REST API Engine<br/>- Eclipse Temurin OpenJDK 21 Runtime<br/>- Async Mailer & Razorpay Client"]
            
            Database["shopstack-db (Port 5432)<br/>- PostgreSQL 16 Alpine Database<br/>- 19 Relational SQL Tables"]
        end

        subgraph "Persistent Storage Volumes"
            VolDB[("PostgreSQL Database Volume<br/>shopstack_postgres_data")]
            VolUploads[("Uploaded Product Images<br/>shopstack_backend_uploads")]
        end
    end

    subgraph "4. Public Internet"
        Client["Browser / Mobile Client<br/>http://13.48.47.35"]
    end

    Client -->|"HTTP Request :80"| Frontend
    Frontend -->|"Proxy Pass /api/ -> http://backend:8080"| Backend
    Frontend -->|"Proxy Pass /uploads/ -> http://backend:8080"| Backend
    Backend -->|"JDBC postgres:5432"| Database
    Database -.-> VolDB
    Backend -.-> VolUploads
```

---

## 📌 Key Capabilities & Enhancements (Day 16)

### 1. Multi-Stage Dockerfile Builds
* **Spring Boot Backend (`backend/Dockerfile`)**:
  - **Stage 1 (Maven Builder)**: Compiles and packages the production executable `.jar` using `maven:3.9.6-eclipse-temurin-21-alpine` with layer-cached dependencies (`mvn dependency:go-offline`).
  - **Stage 2 (Runtime Image)**: Lightweight `eclipse-temurin:21-jre-alpine` runtime with JVM container memory sizing (`-XX:MaxRAMPercentage=75.0`).
* **React Frontend (`frontend/Dockerfile`)**:
  - **Stage 1 (Vite Builder)**: Builds optimized minified static assets via `node:20-alpine`.
  - **Stage 2 (Production Web Server)**: Ultra-fast `nginx:alpine` image serving static assets with gzip compression.

### 2. Production Nginx Reverse Proxy (`frontend/nginx.conf`)
* **SPA Routing Fallback**: `try_files $uri $uri/ /index.html;` ensures React Router paths (`/login`, `/customer-dashboard`, `/admin-dashboard`, `/vendor-dashboard`, `/warehouse-dashboard`) resolve without 404 errors on direct browser refresh.
* **Image & Media Proxy (`location ^~ /uploads/`)**: Uses the `^~` prefix modifier to bypass regex static caching and stream product media directly from the backend volume, eliminating cross-origin (CORS) complexity on the public IP.
* **Large File Uploads**: `client_max_body_size 50M;` permits high-resolution base64 and multipart product image uploads.

### 3. Automated Push-to-Deploy CI/CD Pipeline (`.github/workflows/deploy.yml`)
* **Zero-Touch Cloud Updates**: Whenever changes are pushed to `main`, GitHub Actions automatically:
  1. Validates all required repository secrets (`EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`).
  2. Sets up OpenSSH with Windows-safe CRLF normalization (`tr -d '\r'`).
  3. Uses native `rsync` over SSH for high-speed delta syncing while protecting `.env`, `.pem` keys, and `.git`.
  4. Automatically cleans older Docker build cache (`docker builder prune`) and rebuilds/launches containers.
  5. Deploys the latest code live to `http://13.48.47.35` in under 2 minutes with zero manual SSH needed.

### 4. Real-Time Dual-Database Synchronization Architecture
* **Bi-Directional Cloud & Local Sync (`CloudSyncService.java`)**:
  - Implemented an automated background sync daemon running `@Scheduled(fixedDelay = 5000)` and `@Async` within the Spring Boot engine.
  - Automatically polls the AWS Cloud REST API (`http://13.48.47.35:8080/api/auth/users`) to replicate any new cloud registrations or credential updates into the local PostgreSQL database (`shopstack_db`) with zero manual commands.
  - Automatically pushes local registrations and logins up to the AWS Cloud database in the background.
* **19-Table Enterprise Database Synchronization Tool (`deploy/sync-db.ps1`)**:
  - Full-schema automated sync covering all 19 PostgreSQL tables:
    `users`, `products`, `product_images`, `orders`, `order_items`, `inventories`, `warehouses`, `warehouse_allocations`, `stock_transfers`, `inbound_shipments`, `coupons`, `coupon_usages`, `vendor_coupon_approvals`, `product_coupons`, `user_addresses`, `settlements`, `refunds`, `reviews`, `wishlist_items`.
  - Supports instant 1-click cloud-to-local pull, local-to-cloud push, and continuous live auto-sync (`-Watch`) mode.
* **Database Migration & Seeding**:
  - Automated initial database seeding in `DataLoader.java` for default baseline actors (`admin@admin`, `seller@seller`, `staff@staff`, `customer@gmail.com`).
  - Synchronized all 9 catalog items and 75 high-resolution product images into the persistent Docker volume (`shopstack_backend_uploads`).

---

## 📁 Directory & File Structure Updates (Day 16)

```text
ShopStack-Enterprise-Multi-Vendor-E-Commerce-Platform/
├── .github/
│   └── workflows/
│       └── deploy.yml                       # GitHub Actions CI/CD push-to-deploy workflow with concurrency locks
├── backend/
│   ├── src/main/java/com/shopstack/backend/
│   │   ├── config/                          # Security, CORS, and startup DataLoader configurations
│   │   ├── controller/                      # REST API endpoints (/api/auth, /api/products, etc.)
│   │   ├── model/                           # JPA Entities for all 19 relational tables
│   │   ├── repository/                      # Spring Data JPA Repository interfaces
│   │   └── service/
│   │       └── CloudSyncService.java        # Real-time automated cloud & local DB synchronization service
│   ├── Dockerfile                           # Multi-stage Maven + Eclipse Temurin 21 production image
│   └── .dockerignore                        # Ignores target/, .git/, local uploads from build context
├── frontend/
│   ├── Dockerfile                           # Multi-stage Node 20 + Nginx Alpine static server image
│   ├── nginx.conf                           # Nginx config with SPA routing & ^~ /uploads/ reverse proxy
│   └── .dockerignore                        # Ignores node_modules/, dist/, caches
├── deploy/
│   ├── setup-aws-ec2.sh                     # Automated Ubuntu host bootstrap, swap config & container launcher
│   ├── deploy-to-ec2.ps1                    # One-click Windows PowerShell deployment script
│   ├── sync-db.ps1                          # Full 19-table database synchronization CLI tool (-Watch mode)
│   ├── ec2_key.pem                          # Protected AWS SSH RSA private key (in .gitignore)
│   └── AWS_DEPLOYMENT_GUIDE.md              # Step-by-step evaluator review & operational guide
├── docker-compose.yml                       # Multi-service stack (db, backend, frontend, volumes, networks)
├── .env.example                             # Production environment variables template
├── .gitignore                               # Protects credentials, .pem keys, and build outputs
└── DOCKER_AND_CLOUD_DEPLOYMENT_DOCUMENTATION.txt  # Full deployment specifications & database details
```

---

## 🔐 GitHub Repository Secrets Configuration

Configure the following secrets in **Repository Settings** ➡️ **Secrets and variables** ➡️ **Actions**:

| Secret Name | Value Description | Example / Target Value |
| :--- | :--- | :--- |
| `EC2_HOST` | Public IPv4 address of AWS EC2 instance | `13.48.47.35` |
| `EC2_USER` | EC2 Ubuntu user login | `ubuntu` |
| `EC2_SSH_KEY` | Entire RSA Private Key starting from `-----BEGIN RSA PRIVATE KEY-----` to `-----END RSA PRIVATE KEY-----` | `deploy/ec2_key.pem` content |

---

## ⚙️ Production Environment Variables Template (`.env.example`)

> [!IMPORTANT]
> Confidential keys, secrets, and credentials should **never** be committed to version control. Production values should be configured on the deployment server or managed securely via GitHub Secrets.

```properties
# ==========================================
# PostgreSQL Database Configuration
# ==========================================
POSTGRES_DB=shopstack_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-postgres-password

# ==========================================
# Backend & Platform Configuration
# ==========================================
APP_BACKEND_BASE_URL=http://<your-ec2-ip-or-domain>:8080
SHOPSTACK_COMMISSION_PERCENTAGE=10.0

# ==========================================
# Razorpay Payment Gateway (Test Mode / Sandbox)
# ==========================================
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# ==========================================
# Transactional Email Notification (SMTP)
# ==========================================
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-16-char-smtp-app-password
MAIL_FROM=support@shopstack.com
```

---

## 🚀 Deployment & Synchronization Commands

### 1. Push-to-Deploy via GitHub Actions (Automated CI/CD)
```bash
git add .
git commit -m "feat: updates for cloud deployment"
git push origin main
# GitHub Actions automatically builds and deploys to AWS EC2 in under 2 minutes
```

### 2. One-Click Direct Deployment Script
```powershell
# Windows PowerShell
powershell -ExecutionPolicy Bypass -File deploy\deploy-to-ec2.ps1
```

```bash
# Linux / macOS Bash
bash deploy/setup-aws-ec2.sh
```

### 3. Database Synchronization Commands (`deploy/sync-db.ps1`)
```powershell
# Pull all cloud users, orders, products & tables into Local PostgreSQL:
powershell -ExecutionPolicy Bypass -File deploy\sync-db.ps1 -Direction cloud-to-local

# Continuous Live Auto-Sync (Automatically syncs all 19 tables every 15s in background):
powershell -ExecutionPolicy Bypass -File deploy\sync-db.ps1 -Watch -IntervalSeconds 15

# Push local database changes up to AWS Cloud:
powershell -ExecutionPolicy Bypass -File deploy\sync-db.ps1 -Direction local-to-cloud
```

---

## 🚦 Verification Checklist (Day 16)

### 1. Live Public Storefront & Authentication
1. Open `http://13.48.47.35` in your browser.
2. Verify role-based login and registration flows for all 4 distinct actor profiles:
   - **Administrator**: `admin@admin` / `admin123`
   - **Customer**: `customer@gmail.com` / `customer123`
   - **Vendor**: `seller@seller` / `seller123` (Vendor ID: `123456`)
   - **Warehouse Staff**: `staff@staff` / `staff123`
3. Verify session authentication, JWT/CORS headers, and dynamic role switching through the Nginx reverse proxy.

### 2. Product Catalog & High-Resolution Image Delivery
1. Browse catalog items on the live public storefront (`http://13.48.47.35`).
2. Verify that high-resolution product media files load smoothly via the `/uploads/products/...` reverse proxy with HTTP 200 responses.
3. Open product details and test the multi-image gallery carousels and zoom previews.

### 3. Shopping Cart, "Buy Now" & Payment Gateway Flow
1. Add items to cart or click **"⚡ Buy Now"** for direct single-item checkout.
2. Apply promo coupons (e.g. `SAVE20`).
3. Complete checkout via Razorpay (Test/Sandbox mode) or Cash on Delivery (COD).
4. Verify the order is created, confirmation email is dispatched, and order details appear in **Customer Order History**.

### 4. Multi-Role Fulfillment & Warehouse Workflow
1. Log in as Warehouse Staff (`@staff` account).
2. Move allocated orders along the fulfillment pipeline:
   `1. STOCK ALLOCATED` ➡️ `2. PRODUCT PICKED` ➡️ `3. ORDER PACKED` ➡️ `4. READY FOR SHIPMENT` ➡️ `SHIPPED`.
3. Verify delivery handover (`DELIVERED`) and automated financial settlement generation in the Admin console.

### 5. Automated Real-Time Database Synchronization
1. Register a new user or place an order on `http://13.48.47.35/`.
2. Observe real-time automatic synchronization to your local PostgreSQL database (`shopstack_db`) via `CloudSyncService.java` or `deploy\sync-db.ps1 -Watch`.
3. Inspect local database rows in pgAdmin to verify all relational records match.

### 6. Automated GitHub Actions CI/CD Verification
1. Make a code update in `frontend/src/` or `backend/src/`.
2. Commit and push to `main` branch (`git push origin main`).
3. Open the **Actions** tab on GitHub and confirm that the deployment workflow executes and passes with a green checkmark.
4. Refresh the cloud server endpoint to verify changes are live immediately with zero downtime.
