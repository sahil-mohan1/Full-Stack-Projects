import express from 'express';
import cors from 'cors';
import { initDb, query, get, run } from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
initDb().then(() => {
  console.log('Database tables ready.');
}).catch(err => {
  console.error('Failed to initialize database:', err);
});

// Helper for validating email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ==========================================
// VOLUNTEER ROUTES
// ==========================================

// GET /api/volunteers - Retrieve all volunteers
app.get('/api/volunteers', async (req, res) => {
  try {
    const volunteers = await query('SELECT * FROM volunteers ORDER BY id DESC');
    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// GET /api/volunteers/:id - Retrieve single volunteer & registered events
app.get('/api/volunteers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const volunteer = await get('SELECT * FROM volunteers WHERE id = ?', [id]);
    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    // Get events this volunteer registered for
    const registeredEvents = await query(`
      SELECT e.*, r.registered_at 
      FROM events e
      JOIN registrations r ON e.id = r.event_id
      WHERE r.volunteer_id = ?
      ORDER BY e.date DESC
    `, [id]);

    res.json({ ...volunteer, events: registeredEvents });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// POST /api/volunteers - Create new volunteer
app.post('/api/volunteers', async (req, res) => {
  const { name, email, mobile, city, skills, status } = req.body;

  // Basic Validation
  if (!name || !email || !mobile || !city || !skills) {
    return res.status(400).json({ error: 'All fields (name, email, mobile, city, skills) are required.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }

  try {
    // Check email unique
    const existing = await get('SELECT id FROM volunteers WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ error: 'A volunteer with this email address already exists.' });
    }

    const valStatus = status || 'Active';
    const result = await run(`
      INSERT INTO volunteers (name, email, mobile, city, skills, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [name, email, mobile, city, skills, valStatus]);

    const newVolunteer = await get('SELECT * FROM volunteers WHERE id = ?', [result.id]);
    res.status(201).json(newVolunteer);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// PUT /api/volunteers/:id - Update volunteer details
app.put('/api/volunteers/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, mobile, city, skills, status } = req.body;

  if (!name || !email || !mobile || !city || !skills || !status) {
    return res.status(400).json({ error: 'All fields (name, email, mobile, city, skills, status) are required.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }

  try {
    const volunteer = await get('SELECT id FROM volunteers WHERE id = ?', [id]);
    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    // Check email unique for other records
    const existing = await get('SELECT id FROM volunteers WHERE email = ? AND id != ?', [email, id]);
    if (existing) {
      return res.status(400).json({ error: 'Another volunteer with this email address already exists.' });
    }

    await run(`
      UPDATE volunteers 
      SET name = ?, email = ?, mobile = ?, city = ?, skills = ?, status = ?
      WHERE id = ?
    `, [name, email, mobile, city, skills, status, id]);

    const updatedVolunteer = await get('SELECT * FROM volunteers WHERE id = ?', [id]);
    res.json(updatedVolunteer);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// DELETE /api/volunteers/:id - Delete volunteer
app.delete('/api/volunteers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const volunteer = await get('SELECT id FROM volunteers WHERE id = ?', [id]);
    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    await run('DELETE FROM volunteers WHERE id = ?', [id]);
    res.json({ message: 'Volunteer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});


// ==========================================
// EVENT ROUTES
// ==========================================

// GET /api/events - Retrieve all events (including participant count)
app.get('/api/events', async (req, res) => {
  try {
    const events = await query(`
      SELECT e.*, 
        (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id) as volunteers_joined
      FROM events e
      ORDER BY e.date ASC
    `);
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// GET /api/events/:id - Retrieve event details & registered volunteer list
app.get('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const event = await get(`
      SELECT e.*, 
        (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id) as volunteers_joined
      FROM events e
      WHERE e.id = ?
    `, [id]);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Get list of volunteers registered for this event
    const registeredVolunteers = await query(`
      SELECT v.*, r.registered_at 
      FROM volunteers v
      JOIN registrations r ON v.id = r.volunteer_id
      WHERE r.event_id = ?
      ORDER BY r.registered_at DESC
    `, [id]);

    res.json({ ...event, volunteers: registeredVolunteers });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// POST /api/events - Create new event
app.post('/api/events', async (req, res) => {
  const { name, description, date, location, required_volunteers, status } = req.body;

  if (!name || !description || !date || !location || required_volunteers === undefined) {
    return res.status(400).json({ error: 'All fields (name, description, date, location, required_volunteers) are required.' });
  }

  const parsedReqVol = parseInt(required_volunteers, 10);
  if (isNaN(parsedReqVol) || parsedReqVol < 1) {
    return res.status(400).json({ error: 'Required volunteers count must be a positive integer.' });
  }

  try {
    const valStatus = status || 'Upcoming';
    const result = await run(`
      INSERT INTO events (name, description, date, location, required_volunteers, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [name, description, date, location, parsedReqVol, valStatus]);

    const newEvent = await get('SELECT * FROM events WHERE id = ?', [result.id]);
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// PUT /api/events/:id - Update event details
app.put('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, date, location, required_volunteers, status } = req.body;

  if (!name || !description || !date || !location || required_volunteers === undefined || !status) {
    return res.status(400).json({ error: 'All fields (name, description, date, location, required_volunteers, status) are required.' });
  }

  const parsedReqVol = parseInt(required_volunteers, 10);
  if (isNaN(parsedReqVol) || parsedReqVol < 1) {
    return res.status(400).json({ error: 'Required volunteers count must be a positive integer.' });
  }

  try {
    const event = await get('SELECT id FROM events WHERE id = ?', [id]);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    await run(`
      UPDATE events
      SET name = ?, description = ?, date = ?, location = ?, required_volunteers = ?, status = ?
      WHERE id = ?
    `, [name, description, date, location, parsedReqVol, status, id]);

    const updatedEvent = await get(`
      SELECT e.*, 
        (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id) as volunteers_joined
      FROM events e
      WHERE e.id = ?
    `, [id]);
    
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// DELETE /api/events/:id - Delete event
app.delete('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const event = await get('SELECT id FROM events WHERE id = ?', [id]);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    await run('DELETE FROM events WHERE id = ?', [id]);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});


// ==========================================
// REGISTRATION ROUTE
// ==========================================

// POST /api/events/:id/register - Register volunteer to event
app.post('/api/events/:id/register', async (req, res) => {
  const { id } = req.params; // event_id
  const { volunteerId } = req.body;

  if (!volunteerId) {
    return res.status(400).json({ error: 'volunteerId is required in body.' });
  }

  try {
    // Check event exists
    const event = await get('SELECT * FROM events WHERE id = ?', [id]);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    // Block registrations if event is Cancelled or Completed
    if (event.status === 'Cancelled' || event.status === 'Completed') {
      return res.status(400).json({ error: `Cannot register for a ${event.status.toLowerCase()} event.` });
    }

    // Check volunteer exists and is active
    const volunteer = await get('SELECT * FROM volunteers WHERE id = ?', [volunteerId]);
    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer not found.' });
    }
    if (volunteer.status === 'Inactive') {
      return res.status(400).json({ error: 'Inactive volunteers cannot enroll in events.' });
    }

    // Check if already registered
    const existing = await get('SELECT id FROM registrations WHERE event_id = ? AND volunteer_id = ?', [id, volunteerId]);
    if (existing) {
      return res.status(400).json({ error: 'Volunteer is already registered for this event.' });
    }

    // Add registration
    await run('INSERT INTO registrations (event_id, volunteer_id) VALUES (?, ?)', [id, volunteerId]);

    // Retrieve updated registration details
    const result = await get(`
      SELECT e.name as eventName, v.name as volunteerName
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      JOIN volunteers v ON r.volunteer_id = v.id
      WHERE r.event_id = ? AND r.volunteer_id = ?
    `, [id, volunteerId]);

    res.status(201).json({
      message: 'Registration successful',
      details: result
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// POST /api/events/:id/unregister - Cancel volunteer registration
app.post('/api/events/:id/unregister', async (req, res) => {
  const { id } = req.params;
  const { volunteerId } = req.body;

  if (!volunteerId) {
    return res.status(400).json({ error: 'volunteerId is required in body.' });
  }

  try {
    const existing = await get('SELECT id FROM registrations WHERE event_id = ? AND volunteer_id = ?', [id, volunteerId]);
    if (!existing) {
      return res.status(404).json({ error: 'Registration record not found.' });
    }

    await run('DELETE FROM registrations WHERE event_id = ? AND volunteer_id = ?', [id, volunteerId]);
    res.json({ message: 'Deregistered volunteer successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});


// ==========================================
// DASHBOARD STATS ROUTE
// ==========================================

// GET /api/dashboard/stats - Retrieve NGO stats summary
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const volStats = await get('SELECT COUNT(*) as total FROM volunteers');
    const activeVolStats = await get("SELECT COUNT(*) as active FROM volunteers WHERE status = 'Active'");
    const eventStats = await get('SELECT COUNT(*) as total FROM events');
    const upcomingStats = await get("SELECT COUNT(*) as upcoming FROM events WHERE status = 'Upcoming'");
    const completedStats = await get("SELECT COUNT(*) as completed FROM events WHERE status = 'Completed'");
    const registrationStats = await get("SELECT COUNT(*) as registrations FROM registrations");

    // Fetch some recent activity logs
    const recentActivities = await query(`
      SELECT r.registered_at, v.name as volunteer_name, e.name as event_name
      FROM registrations r
      JOIN volunteers v ON r.volunteer_id = v.id
      JOIN events e ON r.event_id = e.id
      ORDER BY r.registered_at DESC
      LIMIT 5
    `);

    res.json({
      totalVolunteers: volStats.total,
      activeVolunteers: activeVolStats.active,
      totalEvents: eventStats.total,
      upcomingEvents: upcomingStats.upcoming,
      completedEvents: completedStats.completed,
      totalRegistrations: registrationStats.registrations,
      recentActivities
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
