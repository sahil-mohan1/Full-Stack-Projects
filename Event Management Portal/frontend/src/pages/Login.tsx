import React, { useState } from 'react';
import { useNGO } from '../context/NGOContext';
import { Shield, User, Heart, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (page: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const { volunteers, login } = useNGO();
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<string>('');

  const activeVolunteers = volunteers.filter((v) => v.status === 'Active');

  const handleAdminLogin = () => {
    login('Admin');
    onLoginSuccess('dashboard');
  };

  const handleVolunteerLogin = () => {
    if (!selectedVolunteerId) {
      alert('Please select a volunteer profile to simulate login.');
      return;
    }
    login('Volunteer', parseInt(selectedVolunteerId, 10));
    onLoginSuccess('events');
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-16 max-w-4xl mx-auto w-full">
      {/* Brand Header */}
      <div className="text-center space-y-3 mb-12">
        <div className="inline-flex bg-emerald-500/10 p-3 rounded-2xl text-emerald-400 border border-emerald-500/25 glow-emerald mb-2">
          <Heart className="w-8 h-8 animate-pulse" />
        </div>
        <h3 className="text-2xl font-extrabold text-slate-100 tracking-tight sm:text-3xl">
          NGO Volunteer & Event Portal
        </h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          Welcome to the HopeCare volunteer platform. Please authorize your session by selecting a workspace access role below.
        </p>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 gap-8 w-full">
        {/* Administrator Portal */}
        <div className="glass-panel border border-slate-800/80 hover:border-purple-500/30 p-8 rounded-2xl flex flex-col justify-between transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-4">
            <div className="bg-purple-500/10 text-purple-400 p-3 rounded-xl inline-block border border-purple-500/20">
              <Shield className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-lg font-bold text-slate-100">NGO Administrator</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Access NGO statistics, create new volunteer profiles, edit/delete upcoming events, manage attendance sheets, and export CSV compliance reports.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800/60">
            <button
              onClick={handleAdminLogin}
              className="w-full flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-purple-650 hover:bg-purple-600 text-sm font-bold text-white transition-all shadow-lg hover:shadow-purple-500/10 group-hover:-translate-y-0.5"
            >
              <span>Access Admin Workspace</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>

        {/* Volunteer Portal */}
        <div className="glass-panel border border-slate-800/80 hover:border-indigo-500/30 p-8 rounded-2xl flex flex-col justify-between transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-4">
            <div className="bg-indigo-500/10 text-indigo-400 p-3 rounded-xl inline-block border border-indigo-500/20">
              <User className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-lg font-bold text-slate-100">NGO Volunteer</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Browse upcoming community service events, enroll to help distribution drives, view locations, or manage your personal schedule profile.
              </p>
            </div>

            {/* Select Impersonation Profile */}
            <div className="pt-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Select Active Volunteer Profile
              </label>
              <select
                value={selectedVolunteerId}
                onChange={(e) => setSelectedVolunteerId(e.target.value)}
                className="w-full glass-input text-xs"
              >
                <option value="" className="bg-slate-900 text-slate-500">-- Select Volunteer Profile --</option>
                {activeVolunteers.map((vol) => (
                  <option key={vol.id} value={vol.id} className="bg-slate-900 text-slate-200">
                    {vol.name} ({vol.city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800/60">
            <button
              onClick={handleVolunteerLogin}
              className="w-full flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-indigo-650 hover:bg-indigo-600 text-sm font-bold text-white transition-all shadow-lg hover:shadow-indigo-500/10 group-hover:-translate-y-0.5"
            >
              <span>Access Volunteer Schedule</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Helper Tip */}
      <p className="text-[11px] text-slate-500 mt-8 text-center bg-slate-900/20 border border-slate-800/40 rounded-xl px-4 py-2">
        <span className="font-bold text-emerald-400">Assignment Tip:</span> To test custom event enrollments, you can first select a volunteer profile above to login, then click "Join Event" in the Events page.
      </p>
    </div>
  );
};
