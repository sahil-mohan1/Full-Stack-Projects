import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Volunteer, Event, DashboardStats, UserSession, UserRole } from '../types';

const API_BASE = 'http://localhost:5000/api';

interface NGOContextProps {
  volunteers: Volunteer[];
  events: Event[];
  stats: DashboardStats | null;
  currentUser: UserSession | null;
  loading: boolean;
  error: string | null;
  fetchVolunteers: () => Promise<void>;
  fetchEvents: () => Promise<void>;
  fetchStats: () => Promise<void>;
  addVolunteer: (vol: Omit<Volunteer, 'id' | 'created_at'>) => Promise<Volunteer>;
  updateVolunteer: (id: number, vol: Omit<Volunteer, 'id' | 'created_at'>) => Promise<Volunteer>;
  deleteVolunteer: (id: number) => Promise<void>;
  addEvent: (evt: Omit<Event, 'id' | 'created_at' | 'volunteers_joined'>) => Promise<Event>;
  updateEvent: (id: number, evt: Omit<Event, 'id' | 'created_at' | 'volunteers_joined'>) => Promise<Event>;
  deleteEvent: (id: number) => Promise<void>;
  registerForEvent: (eventId: number, volunteerId: number) => Promise<void>;
  unregisterFromEvent: (eventId: number, volunteerId: number) => Promise<void>;
  login: (role: UserRole, volunteerId?: number) => void;
  logout: () => void;
  clearError: () => void;
}

const NGOContext = createContext<NGOContextProps | undefined>(undefined);

export const NGOProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('ngo_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/volunteers`);
      if (!res.ok) throw new Error('Failed to fetch volunteers');
      const data = await res.json();
      setVolunteers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/events`);
      if (!res.ok) throw new Error('Failed to fetch events');
      const data = await res.json();
      setEvents(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/stats`);
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      console.error('Stats fetch error:', err.message);
    }
  };

  const addVolunteer = async (vol: Omit<Volunteer, 'id' | 'created_at'>) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/volunteers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vol),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add volunteer');
      
      setVolunteers((prev) => [data, ...prev]);
      fetchStats(); // Update dashboard counts
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateVolunteer = async (id: number, vol: Omit<Volunteer, 'id' | 'created_at'>) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/volunteers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vol),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update volunteer');
      
      setVolunteers((prev) => prev.map((v) => (v.id === id ? data : v)));
      
      // If updating currently logged in volunteer, sync their name
      if (currentUser?.volunteerId === id) {
        const updatedSession = { ...currentUser, name: data.name };
        setCurrentUser(updatedSession);
        localStorage.setItem('ngo_session', JSON.stringify(updatedSession));
      }
      
      fetchStats();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteVolunteer = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/volunteers/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete volunteer');
      
      setVolunteers((prev) => prev.filter((v) => v.id !== id));
      
      // Auto logout if deleted user was logged in
      if (currentUser?.volunteerId === id) {
        logout();
      }
      
      fetchEvents(); // Refresh event participant counts
      fetchStats();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async (evt: Omit<Event, 'id' | 'created_at' | 'volunteers_joined'>) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evt),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create event');
      
      setEvents((prev) => [...prev, { ...data, volunteers_joined: 0 }]);
      fetchStats();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateEvent = async (id: number, evt: Omit<Event, 'id' | 'created_at' | 'volunteers_joined'>) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evt),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update event');
      
      // Parse output format which returns the updated event list
      setEvents((prev) => prev.map((e) => (e.id === id ? { ...data, volunteers_joined: e.volunteers_joined } : e)));
      fetchStats();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/events/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete event');
      
      setEvents((prev) => prev.filter((e) => e.id !== id));
      fetchStats();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerForEvent = async (eventId: number, volunteerId: number) => {
    try {
      const res = await fetch(`${API_BASE}/events/${eventId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volunteerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register for event');
      
      // Sync local lists
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId ? { ...e, volunteers_joined: e.volunteers_joined + 1 } : e
        )
      );
      fetchStats();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const unregisterFromEvent = async (eventId: number, volunteerId: number) => {
    try {
      const res = await fetch(`${API_BASE}/events/${eventId}/unregister`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volunteerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel registration');
      
      // Sync local lists
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId ? { ...e, volunteers_joined: Math.max(0, e.volunteers_joined - 1) } : e
        )
      );
      fetchStats();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const login = (role: UserRole, volunteerId?: number) => {
    let sessionName = 'Administrator';
    if (role === 'Volunteer' && volunteerId) {
      const vol = volunteers.find((v) => v.id === volunteerId);
      if (vol) sessionName = vol.name;
    }
    const session: UserSession = { role, volunteerId, name: sessionName };
    setCurrentUser(session);
    localStorage.setItem('ngo_session', JSON.stringify(session));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ngo_session');
  };

  useEffect(() => {
    fetchVolunteers();
    fetchEvents();
    fetchStats();
  }, []);

  return (
    <NGOContext.Provider
      value={{
        volunteers,
        events,
        stats,
        currentUser,
        loading,
        error,
        fetchVolunteers,
        fetchEvents,
        fetchStats,
        addVolunteer,
        updateVolunteer,
        deleteVolunteer,
        addEvent,
        updateEvent,
        deleteEvent,
        registerForEvent,
        unregisterFromEvent,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </NGOContext.Provider>
  );
};

export const useNGO = () => {
  const context = useContext(NGOContext);
  if (context === undefined) {
    throw new Error('useNGO must be used within an NGOProvider');
  }
  return context;
};
