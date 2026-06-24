# NGO Volunteer & Event Management Portal

A full-stack, responsive web application designed for Non-Governmental Organizations (NGOs) to manage volunteer profiles, plan community drives/campaigns, track registrations, and monitor impact analytics.

---

## 🌟 Key Features

### Core Features
1. **Volunteer Registration**: Create and manage volunteer profiles (Name, Email, Mobile, City, Skills/Interests, Status).
2. **Volunteer Registry Grid**: Card-based volunteer listings with search keywords and city filters.
3. **Event & Campaign Creation**: Create and edit NGO drives (Name, Description, Location, Target Date, Required volunteers).
4. **Interactive Capacity Tracker**: Visual slot progress bars showing volunteer density (seats enrolled vs required capacity).
5. **Volunteer Enrollment**: Allows active volunteers to enroll or opt-out of upcoming campaigns dynamically.
6. **Campaign Status Tracker**: Manage event lifecycle status (Upcoming, Ongoing, Completed, Cancelled).
7. **Impact Dashboard**: Real-time analytical stats (Total volunteers, Available active members, Upcoming events count, Completed drives, and Enrollment numbers) with a live-updating Activity Feed.

### 🚀 Bonus Challenges Implemented
- **Simulated Auth & Role-Based Access Control**: Toggle between **NGO Administrator** (full CRUD, roster inspections) and **Registered Volunteer** (join/leave campaigns, view personal assignments) via the top header bar.
- **Advanced Search & Multi-Filters**: Filter volunteers by city and status; search events by location and status.
- **Direct CSV Report Exports**: Click a button to download the filtered volunteer list or event schedule directly as a spreadsheet (`.csv`).
- **Live Roster inspector**: Administrators can expand any event card to view the names and contact details of enrolled volunteers.

---

## 🛠️ Technology Stack
- **Frontend**: React (v19), TypeScript (v6), Tailwind CSS (v3) built with Vite (v8) and Lucide Icons.
- **Backend**: Node.js (v22) + Express.js (v4).
- **Database**: SQLite (local serverless database file `database.sqlite` automatically generated on startup).

---

## 🚀 Setup & Installation Instructions

### Prerequisites
Make sure [Node.js](https://nodejs.org/) (v18+) is installed on your machine.

---

### Step 1: Run the Backend Server
1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server (runs on `http://localhost:5000`):
   ```bash
   npm start
   ```
   *Note: On startup, the database is automatically created and seeded with mock volunteer, event, and registration profiles.*

---

### Step 2: Run the Frontend Application
1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Click the link printed in your terminal (usually `http://localhost:5173`) to launch the portal.

---

## 📡 REST API Documentation

### Volunteer Endpoints
- `GET /api/volunteers` - List all registered volunteers.
- `GET /api/volunteers/:id` - Fetch details of a specific volunteer, including their registered events.
- `POST /api/volunteers` - Add a new volunteer.
- `PUT /api/volunteers/:id` - Update volunteer details.
- `DELETE /api/volunteers/:id` - Remove a volunteer (automatically cancels their event enrollments).

### Event Endpoints
- `GET /api/events` - Retrieve all events, including current participant counts.
- `GET /api/events/:id` - Fetch details of a specific event, including the full roster of registered volunteers.
- `POST /api/events` - Create a new event.
- `PUT /api/events/:id` - Modify event details (e.g. status, date, location).
- `DELETE /api/events/:id` - Remove an event (cascades database deletions to registration sheets).

### Enrollment Endpoints
- `POST /api/events/:id/register` - Enroll a volunteer in an event. Expects `{ volunteerId: number }` in body.
- `POST /api/events/:id/unregister` - Deregister/Leave an event. Expects `{ volunteerId: number }` in body.

### Analytics Endpoints
- `GET /api/dashboard/stats` - Fetch overall NGO statistics and the latest enrollment feed.

---

## 📊 Database Schema Details
Refer to [backend/schema.sql](file:///c:/Users/sahil/Desktop/Code/Infine/Full%20Stack%20Projects/Event%20Management%20Portal/backend/schema.sql) for SQL table definitions, constraints, and index details.
