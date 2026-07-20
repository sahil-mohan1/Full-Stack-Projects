# Employee Management System (EMS) 🏢

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)
![PHP](https://img.shields.io/badge/PHP-8.x-777BB4?logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)

A comprehensive, enterprise-grade Employee Management System (EMS) designed to digitize and automate core HR processes. Built with a modern React frontend and a lightweight, high-performance native PHP backend, this system manages the complete employee lifecycle from recruitment to payroll, attendance tracking, and performance reviews.

---

## 📑 Table of Contents
- [✨ Key Features](#-key-features)
- [🛠️ Technology Stack](#️-technology-stack)
- [🏗️ System Architecture](#-system-architecture)
- [🗄️ Database Schema Overview](#️-database-schema-overview)
- [👥 User Roles & Permissions](#-user-roles--permissions)
- [🚀 Installation & Setup](#-installation--setup)
- [💻 Development Guidelines](#-development-guidelines)
- [📄 License](#-license)

---

## ✨ Key Features

The EMS provides a centralized platform to manage organizational processes effectively:

- **🔐 Secure Authentication:** JWT-based stateless authentication with strict Role-Based Access Control (RBAC).
- **📊 Interactive Dashboard:** Real-time metrics, recent activities, and quick summaries tailored to user roles.
- **🧑‍💼 Employee Management:** Complete digital profiles, document uploads, bank details, and salary configurations.
- **🏢 Organization Hierarchy:** Manage departments, designations, and reporting structures.
- **⏰ Attendance & Shifts:** Track daily attendance, manage employee shifts, and monitor worked hours.
- **🏖️ Leave Management:** Automated workflows for leave applications, manager approvals, and balance tracking.
- **💰 Payroll Processing:** Automated salary generation based on attendance, deductions, and bonuses.
- **📈 Performance Reviews:** Goal assignments, team reviews, and KPI tracking.
- **📢 Company Announcements:** Global broadcast system for organizational news and updates.
- **🛡️ Audit Trails:** Comprehensive logging of all system actions for compliance and security.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** [React.js](https://react.dev/) (Functional Components, Hooks)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Fully responsive, mobile-first design)
- **Routing:** [React Router v7](https://reactrouter.com/)
- **State/API:** [Axios](https://axios-http.com/), Context API
- **Icons:** [Lucide React](https://lucide.dev/)
- **Charts:** [Recharts](https://recharts.org/)

### Backend
- **Core:** Raw Object-Oriented PHP 8.x (No heavy frameworks for maximum performance)
- **Database:** MySQL 8.0 (Relational Database)
- **Authentication:** JWT (JSON Web Tokens)
- **Database Access:** PDO (PHP Data Objects) with Prepared Statements

---

## 🏗️ System Architecture

The project follows a decoupled client-server architecture. 

```text
/ems-root
  ├── /backend                  # PHP REST API
  │    ├── /config              # DB connections and environment configs
  │    ├── /middleware          # JWT verification & RBAC checkers
  │    ├── /controllers         # Core business logic and request handling
  │    ├── /models              # Database interactions and queries
  │    ├── /database            # SQL migration and seeder scripts
  │    ├── /public              # API Entry point
  │    └── /uploads             # Secure storage for employee documents
  │
  └── /frontend                 # React SPA
       ├── /src
       │    ├── /components     # Reusable UI elements (Tables, Modals, Forms)
       │    ├── /pages          # Application views (Dashboard, Directory, Payroll)
       │    ├── /context        # Global state (AuthContext)
       │    └── /utils          # API wrappers and helper functions
```

---

## 🗄️ Database Schema Overview

The database is heavily normalized to ensure data integrity. Key entities include:

- **Admin/Security:** `users`, `roles`, `audit_logs`
- **Organization:** `departments`, `designations`
- **Employees:** `employees`, `bank_details`, `salary_details`, `documents`
- **Operations:** `attendance`, `leave_requests`, `shifts`, `holidays`
- **Payroll & Performance:** `payroll`, `performance_reviews`, `assets`

*Note: The complete Entity Relationship Diagram (ERD) can be found in `database_schema.md`.*

---

## 👥 User Roles & Permissions

The system supports a hierarchical permission model:

1. **Super Administrator:** Unrestricted access. Configures master data, policies, and system settings.
2. **HR Administrator:** Manages employee records, processes payroll, handles global attendance/leaves, and broadcasts announcements.
3. **Manager:** Oversees reporting team members, approves leaves, tracks team attendance, and submits performance reviews.
4. **Employee:** Self-service portal to view personal records, mark attendance, apply for leaves, and download payslips.

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v18.0 or higher) and **npm**
- **PHP** (v8.0 or higher)
- **Composer** (PHP Package Manager)
- **MySQL** (v8.0)

### 1. Database Setup
1. Create a new MySQL database named `ems_db`.
2. Import the schema and seed data found in `/backend/database/` or use the provided migration scripts.

### 2. Backend Setup
```bash
# Navigate to the backend directory
cd backend

# Install dependencies (JWT Library, etc.)
composer install

# Configure environment variables
cp .env.example .env
# Edit .env with your DB credentials and a secure JWT_SECRET

# Start the PHP Development Server
php -S localhost:8000 -t public
```
*The API will be available at `http://localhost:8000/api/`*

### 3. Frontend Setup
```bash
# Navigate to the frontend directory
cd frontend

# Install Node dependencies
npm install

# Start the Vite Development Server
npm run dev
```
*The Frontend will be available at `http://localhost:5173`*

---

## 💻 Development Guidelines

To maintain code quality and security, please adhere to the following standards:

### Backend API Standard
- **Security First:** Always use PDO Prepared Statements to prevent SQL Injection. **Never** concatenate variables into SQL strings.
- **Standardized Responses:** All API responses must follow a strict JSON envelope:
  ```json
  {
    "success": true,
    "message": "Operation successful",
    "data": { ... }
  }
  ```
- **Statelessness:** Ensure all endpoints (except `/api/login`) are protected by the JWT middleware.

### Frontend Standard
- **Component Design:** Keep components modular and focused. 
- **Styling:** Strictly use Tailwind CSS utility classes. Avoid inline styles or custom CSS files unless absolutely necessary.
- **State Management:** Use Context for global state (like Authentication) and component state for local UI logic.

---

## 📄 License

This software is for enterprise educational and internal use. All rights reserved.
