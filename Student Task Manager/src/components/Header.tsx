import React from 'react';
import { Sparkles, ClipboardList } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

export const Header: React.FC = () => {
  const { tasks } = useTasks();
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;
  const totalCount = tasks.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <header className="relative w-full glass-card p-6 md:p-8 rounded-2xl mb-8 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl shadow-indigo-glow">
              <Sparkles className="h-5 w-5 text-white animate-pulse" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 font-outfit">
              Workspace Dashboard
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold font-outfit tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200">
            ApexTask
          </h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">
            Track, prioritize, and master your academic tasks and assignments.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/40 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
          <div className="p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
            <ClipboardList className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Task Progress</div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold font-outfit text-white">
                {completionRate}%
              </span>
              <span className="text-xs text-slate-500">
                ({completedCount}/{totalCount})
              </span>
            </div>
            {/* mini progress bar */}
            <div className="w-32 bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
