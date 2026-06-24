import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'emerald' | 'indigo' | 'purple' | 'amber' | 'rose' | 'sky';
  subtext?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, subtext }) => {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      glow: 'hover:shadow-emerald-500/5 glow-emerald',
      iconColor: 'text-emerald-400',
    },
    indigo: {
      bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      glow: 'hover:shadow-indigo-500/5 glow-indigo',
      iconColor: 'text-indigo-400',
    },
    purple: {
      bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      glow: 'hover:shadow-purple-500/5',
      iconColor: 'text-purple-400',
    },
    amber: {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      glow: 'hover:shadow-amber-500/5',
      iconColor: 'text-amber-400',
    },
    rose: {
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      glow: 'hover:shadow-rose-500/5',
      iconColor: 'text-rose-400',
    },
    sky: {
      bg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      glow: 'hover:shadow-sky-500/5',
      iconColor: 'text-sky-400',
    },
  };

  const activeColor = colorMap[color] || colorMap.emerald;

  return (
    <div className={`glass-card p-6 flex items-center justify-between border rounded-2xl relative overflow-hidden transition-all duration-300 ${activeColor.glow}`}>
      {/* Background glow token */}
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-3xl opacity-10 ${color === 'emerald' ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
      
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-extrabold text-slate-100 tracking-tight">{value}</h3>
        {subtext && <p className="text-[10px] text-slate-500 font-medium">{subtext}</p>}
      </div>

      <div className={`p-3.5 rounded-xl border ${activeColor.bg}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};
