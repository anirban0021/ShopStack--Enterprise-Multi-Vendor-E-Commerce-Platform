# ShopStack - Enterprise Multi-Vendor E-Commerce Platform

ShopStack is a full-stack, enterprise-grade multi-vendor e-commerce platform built with **Spring Boot** for the backend RESTful API services and **React.js (Vite)** for the frontend client layer.

---

## 🛠️ Tech Stack & Prerequisites

### **Backend**
* **Language:** Java 17+ / 21
* **Framework:** Spring Boot 3.x
* **Security:** Spring Security & CORS Configuration
* **ORM / Database:** Spring Data JPA, Hibernate, PostgreSQL
* **Build Tool:** Apache Maven

### **Frontend**
* **Framework:** React.js (Bootstrapped with Vite)
* **HTTP Client:** Axios[cite: 1]
* **Routing:** React Router DOM[cite: 1]

### **Tools & Testing**
* **API Testing:** Postman[cite: 1]
* **Database Client:** pgAdmin 4 / psql
* **Version Control:** Git & GitHub[cite: 1]

---

## 📁 Project Architecture & Directory Structure

```text
ShopStack-Enterprise-Multi-Vendor-E-Commerce-Platform/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/shopstack/backend/
│   │   │   │   ├── config/
│   │   │   │   │   └── SecurityConfig.java      # Spring Security & Request Permissive Config
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
    │   │   └── Register.jsx                     # User Registration UI Component
    │   ├── App.jsx                              # Main App Component Container
    │   └── main.jsx                             # React Application Entrypoint
    └── package.json