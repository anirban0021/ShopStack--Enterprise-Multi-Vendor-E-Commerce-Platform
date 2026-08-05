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
- [x] **Paragraph Formatting Preservation**: Integrated custom CSS layout styling rules on the public store catalog details viewport in [HomeDashboard.jsx](file:///c:/Users/ASUS/Desktop/Infosys/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform-main(Copy)/frontend/src/components/HomeDashboard.jsx#L755) to render descriptions using `whiteSpace: 'pre-wrap'`. This preserves line breaks, enters, and custom paragraph separation inputted by merchants.
- [x] **PostgreSQL TEXT Column Type Mapping**: Configured the ORM mapping in [Product.java](file:///c:/Users/ASUS/Desktop/Infosys/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform-main(Copy)/backend/src/main/java/com/shopstack/backend/model/Product.java#L32-L33) to assign the `description` column definition type to `TEXT`. This overrides the default character limit, allowing vendors to submit rich descriptions of arbitrary length.

### 2. Expanded Field Sizes & Live Form Validation Counters
- [x] **Extended Product Name & Order Item Capacities**: Updated the database column configurations in [Product.java](file:///c:/Users/ASUS/Desktop/Infosys/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform-main(Copy)/backend/src/main/java/com/shopstack/backend/model/Product.java#L19-L20) and [OrderItem.java](file:///c:/Users/ASUS/Desktop/Infosys/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform-main(Copy)/backend/src/main/java/com/shopstack/backend/model/OrderItem.java#L19-L20) to use `@Column(length = 1000)`. This prevents order logging crashes and supports descriptive product names (up to 50 words) without database truncation errors.
- [x] **Live Word Counter UI Widgets**: Refined the product listing wizard form in [VendorDashboard.jsx](file:///c:/Users/ASUS/Desktop/Infosys/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform-main(Copy)/frontend/src/components/VendorDashboard.jsx#L587-L633) to render dynamic counter indicators (`X / 50 words` for product name, `X / 500 words` for description) that refresh in real time as the vendor types.
- [x] **Interactive Word Limit Warning & Enforcement**: The word counter widget text dynamically highlights in bright red if limits are exceeded. Furthermore, the submit handler strictly blocks request dispatching, throwing interactive toast alerts if validation rules are violated.

### 3. Fee-Free Checkout Simplification
- [x] **Zero GST Tax & Standard Shipping Fees**: Setup clean checkout policies by setting standard `taxRate` and `shippingFee` variables to `0.0` in both storefront components ([HomeDashboard.jsx](file:///c:/Users/ASUS/Desktop/Infosys/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform-main(Copy)/frontend/src/components/HomeDashboard.jsx#L85) and [CustomerDashboard.jsx](file:///c:/Users/ASUS/Desktop/Infosys/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform-main(Copy)/frontend/src/components/CustomerDashboard.jsx#L56)).
- [x] **Simplified Checkout Summaries**: Cleaned up checkout summary cards by removing Tax (GST) and Shipping cost rows, showing only the Items Subtotal as the final checkout Total.

### 4. Lightweight Stock Level Management API
- [x] **Quick Inline Stock Updates**: Built a focused stock update API endpoint (`PUT /api/products/{id}/stock`) in [ProductController.java](file:///c:/Users/ASUS/Desktop/Infosys/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform-main(Copy)/backend/src/main/java/com/shopstack/backend/controller/ProductController.java#L229-L246). This allows vendors in [VendorDashboard.jsx](file:///c:/Users/ASUS/Desktop/Infosys/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform-main(Copy)/frontend/src/components/VendorDashboard.jsx#L451) and warehouse operators in [WarehouseDashboard.jsx](file:///c:/Users/ASUS/Desktop/Infosys/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform-main(Copy)/frontend/src/components/WarehouseDashboard.jsx#L46) to increment/decrement inventory count directly. Because it is a separate endpoint, it changes the stock without resetting the product's moderator state back to `PENDING` approval.

### 5. Automated Startup Database Seed Cleanup
- [x] **PostConstruct Seeding Handler**: Configured a `cleanupSeedProducts()` hook in [ProductController.java](file:///c:/Users/ASUS/Desktop/Infosys/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform-main(Copy)/backend/src/main/java/com/shopstack/backend/controller/ProductController.java#L37-L54) executing on backend startup. It automatically removes raw seeded mock catalog products that lack a VENDOR owner, ensuring a clean, production-ready workspace for live merchant registration.

### 6. Upload Size Configuration Upgrades
- [x] **Increased Spring Boot/Tomcat Upload Limit**: Added capacity rules inside [application.properties](file:///c:/Users/ASUS/Desktop/Infosys/ShopStack--Enterprise-Multi-Vendor-E-Commerce-Platform-main(Copy)/backend/src/main/resources/application.properties#L10-L14) to raise multipart/form limits to `50MB`. This accommodates large image payloads uploaded as Base64 Data URL strings.

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
  - Test via Postman: `PUT http://localhost:8080/api/products/{productId}/stock` with JSON body `{"stock": 12}`.
  - Assert status code is `200 OK` and the returned payload retains the current product status (e.g. `APPROVED`), showing updated stock.
  - Test via UI: Click the inline `+` or `-` buttons on the Vendor Dashboard inventory table or Warehouse Dashboard master stock list.
  - **Expected Result**: Stock levels update immediately without triggering an admin approval status reset.

### 5. Startup Database Cleanup Hook
- **Test Steps**:
  - Start/restart the Spring Boot application server.
  - Observe the application console logging output for execution queries of default mock entries.
  - Verify your PostgreSQL database catalog: seeded entries without vendor associations are successfully dropped.
  - **Expected Result**: Clean startup with no leftover orphan seed data in the marketplace.