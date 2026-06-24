import React, { useState, useEffect } from 'react';
import { useNGO } from '../context/NGOContext';
import { EventCard } from '../components/EventCard';
import { ExportButton } from '../components/ExportButton';
import { EmptyState } from '../components/EmptyState';
import { Plus, Search, Filter, X, CalendarDays } from 'lucide-react';
import type { Event } from '../types';

export const Events: React.FC = () => {
  const {
    events,
    fetchEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    unregisterFromEvent,
    currentUser,
  } = useNGO();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('');

  // Track event IDs that the currently logged-in volunteer is enrolled in
  const [userRegisteredEventIds, setUserRegisteredEventIds] = useState<number[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [requiredVolunteers, setRequiredVolunteers] = useState('');
  const [status, setStatus] = useState<'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled'>('Upcoming');

  const [validationError, setValidationError] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'Admin';
  const isVolunteer = currentUser?.role === 'Volunteer';
  const currentVolunteerId = currentUser?.volunteerId;

  // Sync registered events list for logged-in volunteer
  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      if (isVolunteer && currentVolunteerId) {
        try {
          const res = await fetch(`http://localhost:5000/api/volunteers/${currentVolunteerId}`);
          if (res.ok) {
            const data = await res.json();
            const eventIds = (data.events || []).map((e: any) => e.id);
            setUserRegisteredEventIds(eventIds);
          }
        } catch (err) {
          console.error('Failed to sync registered events:', err);
        }
      } else {
        setUserRegisteredEventIds([]);
      }
    };
    fetchRegisteredEvents();
  }, [currentUser, events, currentVolunteerId, isVolunteer]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setDate('');
    setLocation('');
    setRequiredVolunteers('');
    setStatus('Upcoming');
    setValidationError(null);
    setEditingEvent(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (event: Event) => {
    setEditingEvent(event);
    setName(event.name);
    setDescription(event.description);
    setDate(event.date);
    setLocation(event.location);
    setRequiredVolunteers(String(event.required_volunteers));
    setStatus(event.status);
    setValidationError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Front-end validations
    if (!name.trim()) return setValidationError('Event name is required.');
    if (!description.trim()) return setValidationError('Event description is required.');
    if (!date.trim()) return setValidationError('Event date is required.');
    if (!location.trim()) return setValidationError('Event location is required.');
    
    const parsedVolCount = parseInt(requiredVolunteers, 10);
    if (isNaN(parsedVolCount) || parsedVolCount < 1) {
      return setValidationError('Required volunteers count must be a positive number.');
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      date,
      location: location.trim(),
      required_volunteers: parsedVolCount,
      status,
    };

    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, payload);
      } else {
        await addEvent(payload);
      }
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      setValidationError(err.message || 'Operation failed.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this event? This will remove all volunteer registrations for this event.')) {
      try {
        await deleteEvent(id);
      } catch (err: any) {
        alert(err.message || 'Failed to delete event.');
      }
    }
  };

  const handleRegister = async (eventId: number) => {
    if (!currentUser) {
      alert('Please switch roles or authenticate using the top header selection first.');
      return;
    }
    if (isVolunteer && currentVolunteerId) {
      try {
        await registerForEvent(eventId, currentVolunteerId);
      } catch (err: any) {
        alert(err.message || 'Enrollment failed.');
      }
    }
  };

  const handleUnregister = async (eventId: number) => {
    if (isVolunteer && currentVolunteerId) {
      try {
        await unregisterFromEvent(eventId, currentVolunteerId);
      } catch (err: any) {
        alert(err.message || 'Failed to cancel enrollment.');
      }
    }
  };

  // Filter events
  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = locationFilter === '' || e.location.toLowerCase() === locationFilter.toLowerCase();
    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;

    return matchesSearch && matchesLocation && matchesStatus;
  });

  const uniqueLocations = Array.from(new Set(events.map((e) => e.location))).filter(Boolean);

  // CSV Configuration for exporting event lists
  const csvHeaders = [
    { key: 'id', label: 'Event ID' },
    { key: 'name', label: 'Event Name' },
    { key: 'description', label: 'Description' },
    { key: 'date', label: 'Event Date' },
    { key: 'location', label: 'Location' },
    { key: 'required_volunteers', label: 'Required Seats' },
    { key: 'volunteers_joined', label: 'Enrolled Volunteers' },
    { key: 'status', label: 'Event Status' }
  ];

  return (
    <div className="flex-1 p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <ExportButton
            data={filteredEvents}
            headers={csvHeaders}
            filename={`NGO_Events_Status_${new Date().toISOString().slice(0,10)}`}
          />
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-bold text-white transition-all shadow-md shadow-emerald-600/10 hover:shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Campaign Event</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel border border-slate-800/80 p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search campaigns by event name, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full glass-input text-xs pl-10"
          />
        </div>

        {/* Location Filter */}
        <div className="relative w-full md:w-48">
          <Filter className="absolute left-3.5 top-3 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="w-full glass-input text-xs pl-9 cursor-pointer appearance-none"
          >
            <option value="" className="bg-slate-900 text-slate-500">All Locations</option>
            {uniqueLocations.map((loc) => (
              <option key={loc} value={loc} className="bg-slate-900 text-slate-200">
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="relative w-full md:w-48">
          <Filter className="absolute left-3.5 top-3 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full glass-input text-xs pl-9 cursor-pointer appearance-none"
          >
            <option value="All" className="bg-slate-900 text-slate-200">All Statuses</option>
            <option value="Upcoming" className="bg-slate-900 text-slate-200">Upcoming</option>
            <option value="Ongoing" className="bg-slate-900 text-slate-200">Ongoing</option>
            <option value="Completed" className="bg-slate-900 text-slate-200">Completed</option>
            <option value="Cancelled" className="bg-slate-900 text-slate-200">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isRegistered={userRegisteredEventIds.includes(event.id)}
              onEdit={handleOpenEditModal}
              onDelete={handleDelete}
              onRegister={handleRegister}
              onUnregister={handleUnregister}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No NGO Events Found"
          message="Adjust your filters, search terms, or status selection to locate events."
          actionButton={
            isAdmin ? (
              <button
                onClick={handleOpenAddModal}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Campaign Event</span>
              </button>
            ) : undefined
          }
        />
      )}

      {/* CRUD Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
          <div className="glass-panel border border-slate-700/50 w-full max-w-lg rounded-2xl shadow-2xl relative flex flex-col my-8">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800/60 flex justify-between items-center">
              <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-emerald-400" />
                <span>{editingEvent ? 'Update Campaign Details' : 'Create New NGO Campaign'}</span>
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {validationError && (
                <div className="bg-red-500/10 text-red-400 border border-red-500/25 px-4 py-2.5 rounded-lg flex items-center space-x-2 text-[11px] font-semibold">
                  <span>{validationError}</span>
                </div>
              )}

              {/* Event Name */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Event Name
                </label>
                <input
                  type="text"
                  placeholder="Food Distribution Drive"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full glass-input"
                  required
                />
              </div>

              {/* Event Description */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Event Description
                </label>
                <textarea
                  placeholder="Provide brief details about the campaign..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full glass-input min-h-[80px]"
                  required
                />
              </div>

              {/* Location and Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Location / Venue
                  </label>
                  <input
                    type="text"
                    placeholder="Chennai"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full glass-input"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full glass-input cursor-pointer"
                    required
                  />
                </div>
              </div>

              {/* Required Volunteers & Status Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Required Volunteers Count
                  </label>
                  <input
                    type="number"
                    placeholder="20"
                    value={requiredVolunteers}
                    onChange={(e) => setRequiredVolunteers(e.target.value)}
                    className="w-full glass-input"
                    min="1"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Event Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full glass-input cursor-pointer"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-800/60 flex justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/10 hover:shadow-emerald-500/20 font-bold transition-all"
                >
                  {editingEvent ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
