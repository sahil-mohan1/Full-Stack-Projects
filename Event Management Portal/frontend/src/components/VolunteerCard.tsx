import React, { useState } from 'react';
import type { Volunteer } from '../types';
import { useNGO } from '../context/NGOContext';
import { Mail, Phone, MapPin, Tag, Edit, Trash2, CalendarRange, ChevronDown, ChevronUp } from 'lucide-react';

interface VolunteerCardProps {
  volunteer: Volunteer;
  onEdit: (volunteer: Volunteer) => void;
  onDelete: (id: number) => void;
}

export const VolunteerCard: React.FC<VolunteerCardProps> = ({ volunteer, onEdit, onDelete }) => {
  const { currentUser } = useNGO();
  const [showEvents, setShowEvents] = useState(false);

  const skillsList = volunteer.skills
    ? volunteer.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const isAdmin = currentUser?.role === 'Admin';

  return (
    <div className="glass-card border border-slate-800/80 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col h-full">
      {/* Card Header */}
      <div className="p-6 pb-4 border-b border-slate-800/40 relative">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-base font-bold text-slate-100 hover:text-emerald-400 transition-colors">
              {volunteer.name}
            </h4>
            <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{volunteer.city}</span>
            </div>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
            volunteer.status === 'Active'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 glow-emerald'
              : 'bg-slate-800 text-slate-500 border-slate-700/50'
          }`}>
            {volunteer.status}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 py-4 flex-1 space-y-3.5 text-xs">
        {/* Contact Info */}
        <div className="space-y-2.5 text-slate-350">
          <div className="flex items-center space-x-2.5">
            <Mail className="w-4 h-4 text-slate-500 shrink-0" />
            <a href={`mailto:${volunteer.email}`} className="hover:text-emerald-400 transition-colors truncate">
              {volunteer.email}
            </a>
          </div>
          <div className="flex items-center space-x-2.5">
            <Phone className="w-4 h-4 text-slate-500 shrink-0" />
            <a href={`tel:${volunteer.mobile}`} className="hover:text-emerald-400 transition-colors">
              {volunteer.mobile}
            </a>
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center space-x-1">
            <Tag className="w-3 h-3" />
            <span>Skills & Interests</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {skillsList.length > 0 ? (
              skillsList.map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-slate-800/60 text-slate-300 border border-slate-800 px-2 py-0.5 rounded-md text-[10px] font-medium"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-slate-500 italic text-[11px]">No skills listed</span>
            )}
          </div>
        </div>
      </div>

      {/* Accordion / Schedule Panel */}
      {volunteer.events && volunteer.events.length > 0 && (
        <div className="border-t border-slate-800/30">
          <button
            onClick={() => setShowEvents(!showEvents)}
            className="w-full flex items-center justify-between px-6 py-3 text-[11px] font-bold text-slate-450 hover:bg-slate-900/40 hover:text-slate-300 transition-colors"
          >
            <span className="flex items-center space-x-1.5">
              <CalendarRange className="w-3.5 h-3.5 text-slate-500" />
              <span>Registered Events ({volunteer.events.length})</span>
            </span>
            {showEvents ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showEvents && (
            <div className="px-6 pb-4 pt-1 space-y-2 max-h-32 overflow-y-auto bg-slate-950/20 border-t border-slate-800/20">
              {volunteer.events.map((evt) => (
                <div key={evt.id} className="flex justify-between items-center text-[10px] py-1 border-b border-slate-800/20 last:border-b-0">
                  <span className="text-slate-300 truncate font-semibold pr-2">{evt.name}</span>
                  <span className={`shrink-0 font-bold uppercase tracking-wider text-[8px] px-1.5 py-0.5 rounded ${
                    evt.status === 'Upcoming' ? 'bg-indigo-500/10 text-indigo-400' :
                    evt.status === 'Ongoing' ? 'bg-emerald-500/10 text-emerald-400' :
                    evt.status === 'Completed' ? 'bg-slate-800 text-slate-450' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {evt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Card Footer Actions */}
      {isAdmin && (
        <div className="p-4 bg-slate-900/20 border-t border-slate-800/40 flex justify-end space-x-2 shrink-0">
          <button
            onClick={() => onEdit(volunteer)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/70 border border-slate-750 text-slate-300 transition-all text-[11px] font-semibold"
          >
            <Edit className="w-3.5 h-3.5 text-slate-400" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => onDelete(volunteer.id)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-550/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all text-[11px] font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove</span>
          </button>
        </div>
      )}
    </div>
  );
};
