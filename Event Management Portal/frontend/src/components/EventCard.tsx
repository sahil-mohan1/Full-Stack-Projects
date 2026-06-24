import React, { useState } from 'react';
import type { Event, Volunteer } from '../types';
import { useNGO } from '../context/NGOContext';
import { Calendar, MapPin, Users, Edit, Trash2, UserMinus, Plus } from 'lucide-react';

interface EventCardProps {
  event: Event;
  isRegistered: boolean;
  onEdit: (event: Event) => void;
  onDelete: (id: number) => void;
  onRegister: (id: number) => void;
  onUnregister: (id: number) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  isRegistered,
  onEdit,
  onDelete,
  onRegister,
  onUnregister,
}) => {
  const { currentUser } = useNGO();
  const [showRoster, setShowRoster] = useState(false);
  const [rosterList, setRosterList] = useState<Volunteer[]>([]);

  const isAdmin = currentUser?.role === 'Admin';
  const isVolunteer = currentUser?.role === 'Volunteer';
  
  // Format Date to DD-MMM-YYYY (e.g. 15-Aug-2026)
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const day = date.getDate();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateStr;
    }
  };

  const percentageFilled = Math.min(
    100,
    Math.round((event.volunteers_joined / event.required_volunteers) * 100)
  );

  const fetchRoster = async () => {
    if (showRoster) {
      setShowRoster(false);
      return;
    }
    
    try {
      const res = await fetch(`http://localhost:5000/api/events/${event.id}`);
      if (res.ok) {
        const data = await res.json();
        setRosterList(data.volunteers || []);
      }
    } catch (err) {
      console.error('Failed to fetch roster:', err);
    } finally {
      setShowRoster(true);
    }
  };

  const statusColors = {
    Upcoming: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 glow-indigo',
    Ongoing: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 glow-emerald',
    Completed: 'bg-slate-800 text-slate-400 border-slate-700/50',
    Cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const isFull = event.volunteers_joined >= event.required_volunteers;
  const isRegistrationClosed = event.status === 'Completed' || event.status === 'Cancelled';

  return (
    <div className="glass-card border border-slate-800/80 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col h-full">
      {/* Event Header Banner */}
      <div className="p-6 pb-4 border-b border-slate-800/40 relative">
        <div className="flex justify-between items-start">
          <div className="space-y-1 pr-4">
            <h4 className="text-base font-bold text-slate-100 line-clamp-1">{event.name}</h4>
            <div className="flex items-center space-x-3 text-[11px] text-slate-400">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{formatDate(event.date)}</span>
              </span>
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{event.location}</span>
              </span>
            </div>
          </div>
          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${statusColors[event.status]}`}>
            {event.status}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="p-6 py-4 flex-1 flex flex-col space-y-4">
        <p className="text-xs text-slate-350 leading-relaxed flex-1">
          {event.description}
        </p>

        {/* Slots Meter */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
            <span className="text-slate-500 flex items-center space-x-1">
              <Users className="w-3.5 h-3.5" />
              <span>Volunteers enrolled</span>
            </span>
            <span className={isFull ? 'text-emerald-400' : 'text-slate-300'}>
              {event.volunteers_joined} / {event.required_volunteers} {isFull && '(Filled)'}
            </span>
          </div>

          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/60">
            <div
              style={{ width: `${percentageFilled}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                event.status === 'Cancelled' ? 'bg-red-500/40' :
                isFull ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-emerald-500'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Roster Accordion for Admins */}
      {isAdmin && showRoster && (
        <div className="px-6 py-3 bg-slate-950/35 border-t border-slate-800/40 text-[11px]">
          <h5 className="font-bold text-slate-400 mb-2">Registered Roster ({rosterList.length})</h5>
          {rosterList.length > 0 ? (
            <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
              {rosterList.map((vol) => (
                <div key={vol.id} className="flex justify-between items-center bg-slate-900/40 px-2 py-1 rounded border border-slate-850">
                  <span className="text-slate-200 font-medium">{vol.name}</span>
                  <span className="text-slate-500 text-[10px]">{vol.mobile}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-550 italic">No registrations for this event yet.</p>
          )}
        </div>
      )}

      {/* Card Actions */}
      <div className="p-4 bg-slate-900/20 border-t border-slate-800/40 flex items-center justify-between gap-2 shrink-0">
        <div>
          {isAdmin && (
            <button
              onClick={fetchRoster}
              className="text-[11px] font-bold text-emerald-400 hover:text-emerald-350 transition-colors"
            >
              {showRoster ? 'Hide Roster' : 'View Roster'}
            </button>
          )}
        </div>

        <div className="flex space-x-1.5">
          {isAdmin && (
            <>
              <button
                onClick={() => onEdit(event)}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/70 border border-slate-750 text-slate-350 transition-all text-xs font-semibold"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => onDelete(event.id)}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-red-550/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all text-xs font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </>
          )}

          {isVolunteer && (
            isRegistered ? (
              <button
                onClick={() => onUnregister(event.id)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 transition-all text-xs font-bold shadow-md shadow-red-500/5"
              >
                <UserMinus className="w-4 h-4" />
                <span>Leave Event</span>
              </button>
            ) : (
              <button
                disabled={isRegistrationClosed || isFull}
                onClick={() => onRegister(event.id)}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  isRegistrationClosed
                    ? 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed'
                    : isFull
                    ? 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/10 hover:shadow-emerald-500/20'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Join Event</span>
              </button>
            )
          )}

          {!currentUser && (
            <button
              disabled={isRegistrationClosed}
              onClick={() => onRegister(event.id)} // will trigger login/register prompt
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                isRegistrationClosed
                  ? 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Enroll Now</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
