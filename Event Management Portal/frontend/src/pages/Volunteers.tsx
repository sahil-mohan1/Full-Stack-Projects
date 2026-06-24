import React, { useState } from 'react';
import { useNGO } from '../context/NGOContext';
import { VolunteerCard } from '../components/VolunteerCard';
import { ExportButton } from '../components/ExportButton';
import { EmptyState } from '../components/EmptyState';
import { Plus, Search, Filter, X, UserPlus } from 'lucide-react';
import type { Volunteer } from '../types';

export const Volunteers: React.FC = () => {
  const { volunteers, addVolunteer, updateVolunteer, deleteVolunteer, currentUser } = useNGO();
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [city, setCity] = useState('');
  const [skills, setSkills] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  
  // Validation error state
  const [validationError, setValidationError] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'Admin';

  const resetForm = () => {
    setName('');
    setEmail('');
    setMobile('');
    setCity('');
    setSkills('');
    setStatus('Active');
    setValidationError(null);
    setEditingVolunteer(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (volunteer: Volunteer) => {
    setEditingVolunteer(volunteer);
    setName(volunteer.name);
    setEmail(volunteer.email);
    setMobile(volunteer.mobile);
    setCity(volunteer.city);
    setSkills(volunteer.skills);
    setStatus(volunteer.status);
    setValidationError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Frontend validations
    if (!name.trim()) return setValidationError('Name is required.');
    if (!email.trim()) return setValidationError('Email is required.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setValidationError('Please enter a valid email address.');
    if (!mobile.trim()) return setValidationError('Mobile number is required.');
    if (!/^\d{10}$/.test(mobile.trim())) return setValidationError('Mobile number must be exactly 10 digits.');
    if (!city.trim()) return setValidationError('City is required.');
    if (!skills.trim()) return setValidationError('Please specify at least one skill.');

    const payload = {
      name: name.trim(),
      email: email.trim(),
      mobile: mobile.trim(),
      city: city.trim(),
      skills: skills.trim(),
      status
    };

    try {
      if (editingVolunteer) {
        await updateVolunteer(editingVolunteer.id, payload);
      } else {
        await addVolunteer(payload);
      }
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      setValidationError(err.message || 'Operation failed. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this volunteer? All event registrations for this volunteer will also be deleted.')) {
      try {
        await deleteVolunteer(id);
      } catch (err: any) {
        alert(err.message || 'Failed to delete volunteer.');
      }
    }
  };

  // Filter volunteers
  const filteredVolunteers = volunteers.filter((vol) => {
    const matchesSearch =
      vol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vol.skills.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vol.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCity = cityFilter === '' || vol.city.toLowerCase() === cityFilter.toLowerCase();
    const matchesStatus = statusFilter === 'All' || vol.status === statusFilter;

    return matchesSearch && matchesCity && matchesStatus;
  });

  // Get list of unique cities for dropdown filter
  const uniqueCities = Array.from(new Set(volunteers.map((v) => v.city))).filter(Boolean);

  // CSV Configuration
  const csvHeaders = [
    { key: 'id', label: 'Volunteer ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'mobile', label: 'Mobile Number' },
    { key: 'city', label: 'City' },
    { key: 'skills', label: 'Skills' },
    { key: 'status', label: 'Status' },
    { key: 'created_at', label: 'Registered Date' }
  ];

  return (
    <div className="flex-1 p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <ExportButton
            data={filteredVolunteers}
            headers={csvHeaders}
            filename={`NGO_Volunteer_List_${new Date().toISOString().slice(0,10)}`}
          />
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-bold text-white transition-all shadow-md shadow-emerald-600/10 hover:shadow-emerald-500/20 active:translate-y-0"
          >
            <Plus className="w-4 h-4" />
            <span>Register Volunteer</span>
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
            placeholder="Search volunteers by name, city, skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full glass-input text-xs pl-10"
          />
        </div>

        {/* City Filter */}
        <div className="relative w-full md:w-48">
          <Filter className="absolute left-3.5 top-3 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="w-full glass-input text-xs pl-9 cursor-pointer appearance-none"
          >
            <option value="" className="bg-slate-900 text-slate-500">All Cities</option>
            {uniqueCities.map((city) => (
              <option key={city} value={city} className="bg-slate-900 text-slate-200">
                {city}
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
            <option value="Active" className="bg-slate-900 text-slate-200">Active</option>
            <option value="Inactive" className="bg-slate-900 text-slate-200">Inactive</option>
          </select>
        </div>
      </div>

      {/* Grid of Volunteer Cards */}
      {filteredVolunteers.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVolunteers.map((vol) => (
            <VolunteerCard
              key={vol.id}
              volunteer={vol}
              onEdit={handleOpenEditModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Volunteers Found"
          message="Adjust your filters or type a different keyword (e.g. specific skills like Teaching, Cooking)."
          actionButton={
            isAdmin ? (
              <button
                onClick={handleOpenAddModal}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register Volunteer</span>
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
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <span>{editingVolunteer ? 'Update Volunteer Profile' : 'Register New Volunteer'}</span>
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {validationError && (
                <div className="bg-red-500/10 text-red-400 border border-red-500/25 px-4 py-2.5 rounded-lg flex items-center space-x-2 text-[11px] font-semibold">
                  <span>{validationError}</span>
                </div>
              )}

              {/* Name */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Rahul Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full glass-input"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="rahul@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input"
                  required
                />
              </div>

              {/* Mobile and City row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full glass-input"
                    maxLength={10}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="Chennai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full glass-input"
                    required
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Skills & Interests (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Teaching, First Aid, Logistics"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full glass-input"
                  required
                />
                <p className="text-[10px] text-slate-500 font-medium">Please separate multiple skills using commas.</p>
              </div>

              {/* Status Select */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Registration Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                  className="w-full glass-input cursor-pointer"
                >
                  <option value="Active">Active (Available for events)</option>
                  <option value="Inactive">Inactive (Restricted from event signups)</option>
                </select>
              </div>

              {/* Modal Footer Actions */}
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
                  {editingVolunteer ? 'Save Changes' : 'Register Volunteer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
