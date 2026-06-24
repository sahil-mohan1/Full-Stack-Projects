import React from 'react';

interface HeaderProps {
  title: string;
  description: string;
}

export const Header: React.FC<HeaderProps> = ({ title, description }) => {
  return (
    <header className="glass-panel border-b border-slate-800/80 px-8 py-5 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
          {title}
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-medium">{description}</p>
      </div>

      <div className="flex items-center space-x-4">
        {/* Connection status dot */}
        <div className="flex items-center space-x-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 shadow-sm shadow-emerald-500/5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 absolute"></span>
          <span className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase">Live Link</span>
        </div>
      </div>
    </header>
  );
};
