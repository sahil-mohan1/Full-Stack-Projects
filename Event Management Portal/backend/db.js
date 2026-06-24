import sqlite3 from 'sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Promisified database queries helper
export const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// Initialize Tables and seed data
export const initDb = async () => {
  try {
    // Enable foreign keys
    await run('PRAGMA foreign_keys = ON');

    // Create Volunteers table
    await run(`
      CREATE TABLE IF NOT EXISTS volunteers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        mobile TEXT NOT NULL,
        city TEXT NOT NULL,
        skills TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Events table
    await run(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        date TEXT NOT NULL,
        location TEXT NOT NULL,
        required_volunteers INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'Upcoming',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Registrations (enrollments) table
    await run(`
      CREATE TABLE IF NOT EXISTS registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        volunteer_id INTEGER NOT NULL,
        registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE,
        FOREIGN KEY(volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE,
        UNIQUE(event_id, volunteer_id)
      )
    `);

    // Seed data if database is empty
    const volCount = await get('SELECT COUNT(*) as count FROM volunteers');
    if (volCount.count === 0) {
      await run(`
        INSERT INTO volunteers (name, email, mobile, city, skills, status) VALUES
        ('Rahul Kumar', 'rahul@gmail.com', '9876543210', 'Chennai', 'Teaching, Public Speaking', 'Active'),
        ('Priya Sharma', 'priya@gmail.com', '9876543211', 'Mumbai', 'First Aid, Organizing', 'Active'),
        ('Amit Patel', 'amit@gmail.com', '9876543212', 'Delhi', 'Teaching, Logistics', 'Active'),
        ('Sneha Reddy', 'sneha@gmail.com', '9876543213', 'Bangalore', 'Social Media, Writing', 'Active'),
        ('Vikram Singh', 'vikram@gmail.com', '9876543214', 'Chennai', 'Logistics, Cooking', 'Inactive'),
        ('Rohan Sharma', 'rohan@gmail.com', '9876543220', 'Mumbai', 'Teaching, Mentoring', 'Active'),
        ('Ananya Iyer', 'ananya@gmail.com', '9876543221', 'Chennai', 'First Aid, Event Planning', 'Active'),
        ('Kabir Verma', 'kabir@gmail.com', '9876543222', 'Bangalore', 'Coding, Graphic Design', 'Active')
      `);
      console.log('Seeded volunteers.');
    }

    const eventCount = await get('SELECT COUNT(*) as count FROM events');
    if (eventCount.count === 0) {
      await run(`
        INSERT INTO events (name, description, date, location, required_volunteers, status) VALUES
        ('Food Distribution Drive', 'Distributing meal packets to underprivileged families in local shelters.', '2026-08-15', 'Chennai', 20, 'Upcoming'),
        ('Blood Donation Camp', 'Organizing a multi-specialty blood donation camp in association with Red Cross.', '2026-06-25', 'Mumbai', 10, 'Upcoming'),
        ('Slum Educational Drive', 'Teaching basic arithmetic and language skills to children in local slum schools.', '2026-05-10', 'Delhi', 5, 'Completed'),
        ('Beach Cleanup Campaign', 'Annual coastal cleanup event targeting plastic waste elimination.', '2026-06-08', 'Chennai', 50, 'Ongoing'),
        ('Tree Plantation Initiative', 'Planting 500 saplings across community parks and roadside green patches.', '2026-04-22', 'Bangalore', 15, 'Cancelled')
      `);
      console.log('Seeded events.');
    }

    const regCount = await get('SELECT COUNT(*) as count FROM registrations');
    if (regCount.count === 0) {
      await run(`
        INSERT INTO registrations (event_id, volunteer_id) VALUES
        (1, 1),
        (1, 4),
        (2, 2),
        (3, 3),
        (4, 1),
        (4, 2)
      `);
      console.log('Seeded registrations.');
    }

    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('Error initializing SQLite database:', error);
  }
};

export default db;
