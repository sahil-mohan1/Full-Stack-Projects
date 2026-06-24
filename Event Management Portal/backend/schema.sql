-- NGO Volunteer & Event Management Portal
-- Database Schema Script for SQLite / MySQL

-- 1. Volunteers Table
CREATE TABLE IF NOT EXISTS volunteers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  mobile TEXT NOT NULL,
  city TEXT NOT NULL,
  skills TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Events Table
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  date TEXT NOT NULL, -- Format: YYYY-MM-DD
  location TEXT NOT NULL,
  required_volunteers INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'Upcoming', -- Options: Upcoming, Ongoing, Completed, Cancelled
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Event Registrations Table (Join Table)
CREATE TABLE IF NOT EXISTS registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL,
  volunteer_id INTEGER NOT NULL,
  registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY(volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE,
  UNIQUE(event_id, volunteer_id)
);

-- Index optimizations (useful for query performance on relations)
CREATE INDEX IF NOT EXISTS idx_registrations_event ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_volunteer ON registrations(volunteer_id);

-- Sample Seed Data (For Testing)
-- INSERT INTO volunteers (name, email, mobile, city, skills, status) VALUES 
-- ('Rahul Kumar', 'rahul@gmail.com', '9876543210', 'Chennai', 'Teaching, Public Speaking', 'Active');

-- INSERT INTO events (name, description, date, location, required_volunteers, status) VALUES
-- ('Food Distribution Drive', 'Distributing meal packets to underprivileged families in local shelters.', '2026-08-15', 'Chennai', 20, 'Upcoming');

-- INSERT INTO registrations (event_id, volunteer_id) VALUES (1, 1);
