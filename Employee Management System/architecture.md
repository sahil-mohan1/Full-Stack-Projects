# Architectural Guidelines - EMS Project

## Tech Stack
- Frontend: React.js (Vite, Functional Components, Hooks)
- Styling: Tailwind CSS (Mobile-responsive design)
- Backend: Raw PHP REST API (Object-Oriented, PDO, No heavy frameworks)
- Database: MySQL 8.0
- Auth: JWT (JSON Web Tokens) stateless authentication

## Directory Structure
/ems-root
  ├── /backend
  │    ├── /config (DB connections)
  │    ├── /middleware (Auth / Role checkers)
  │    ├── /controllers
  │    └── /models
  └── /frontend
       ├── /src
       │    ├── /components (Reusable UI: Buttons, Modals, Tables)
       │    ├── /pages (Dashboard, EmployeeList, LeaveApply)
       │    ├── /context (AuthContext)
       │    └── /utils (API fetch wrappers)

## Coding Standards & Error Handling
- PHP: Always use prepared statements with PDO. Never concatenate variables into SQL query strings.
- PHP: Return responses strictly in JSON format using a standard wrapper:
  { "success": boolean, "data": object/array, "message": "string" }
- React: Use descriptive variable names and avoid inline styles—rely entirely on Tailwind.
- Security: All API routes except `/api/login` and `/api/forgot-password` require JWT verification via middleware.