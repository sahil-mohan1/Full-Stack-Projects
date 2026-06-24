import React from 'react';
import { useNGO } from '../context/NGOContext';
import { LayoutDashboard, Users, Calendar, LogOut, Heart, Shield, User } from 'lucide-react';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
  const { currentUser, logout } = useNGO();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'volunteers', label: 'Volunteers', icon: Users },
    { id: 'events', label: 'Events & Activities', icon: Calendar },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-slate-800/80 flex flex-col h-screen sticky top-0">
      {/* Brand Logo */}
      <div className="p-6 border-b border-slate-800/60 flex items-center space-x-3">
        <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400 glow-emerald">
          <Heart className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-wide bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">
            HopeCare NGO
          </h1>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
            Portal Suite
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 glow-emerald'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-200 ${
                isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:scale-105'
              }`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-slate-800/60 bg-slate-950/40">
        {currentUser ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                currentUser.role === 'Admin' 
                  ? 'bg-purple-500/10 text-purple-400' 
                  : 'bg-indigo-500/10 text-indigo-400'
              }`}>
                {currentUser.role === 'Admin' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  {currentUser.role} Account
                </p>
                <p className="text-sm font-medium text-slate-200 truncate">
                  {currentUser.name}
                </p>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-slate-850 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/30 text-xs font-semibold text-slate-400 hover:text-red-400 transition-all duration-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-xs text-slate-500 mb-2">Not authenticated</p>
            <button
              onClick={() => setActivePage('login')}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-all shadow-md shadow-emerald-600/10 hover:shadow-emerald-500/20"
            >
              <span>Authenticate Account</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
