import React from 'react';
import { HelpCircle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  message: string;
  actionButton?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, message, actionButton }) => {
  return (
    <div className="glass-panel border border-slate-800/60 rounded-2xl p-12 text-center max-w-lg mx-auto flex flex-col items-center justify-center space-y-4">
      <div className="bg-slate-950 p-4 rounded-full border border-slate-800 text-slate-500 glow-indigo">
        <HelpCircle className="w-8 h-8" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-slate-200">{title}</h3>
        <p className="text-xs text-slate-400 max-w-sm leading-relaxed">{message}</p>
      </div>
      {actionButton && <div className="pt-2">{actionButton}</div>}
    </div>
  );
};
