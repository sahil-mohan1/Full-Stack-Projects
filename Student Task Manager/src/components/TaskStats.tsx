import React from 'react';
import { BarChart3, AlertCircle, CheckCircle2, ListTodo } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

export const TaskStats: React.FC = () => {
  const { tasks } = useTasks();

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'Completed').length;
  const pending = total - completed;
  const highPriority = tasks.filter((t) => t.priority === 'High' && t.status === 'Pending').length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Card */}
      <div className="glass-card p-5 rounded-2xl relative overflow-hidden transition-all duration-300 hover:border-white/10 group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-400">Total Tasks</span>
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
            <ListTodo className="h-5 w-5" />
          </div>
        </div>
        <div className="text-3xl font-bold font-outfit text-white">{total}</div>
        <div className="text-xs text-slate-500 mt-1">Workspace workload</div>
      </div>

      {/* Pending Card */}
      <div className="glass-card p-5 rounded-2xl relative overflow-hidden transition-all duration-300 hover:border-white/10 group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-violet-500/10 transition-colors" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-400">Pending</span>
          <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>
        <div className="text-3xl font-bold font-outfit text-white">{pending}</div>
        <div className="text-xs text-slate-500 mt-1">Awaiting actions</div>
      </div>

      {/* Completed Card */}
      <div className="glass-card p-5 rounded-2xl relative overflow-hidden transition-all duration-300 hover:border-white/10 group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-400">Completed</span>
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
        <div className="text-3xl font-bold font-outfit text-emerald-400 text-glow-emerald">{completed}</div>
        <div className="text-xs text-slate-500 mt-1">Successfully finished</div>
      </div>

      {/* High Priority Urgent Card */}
      <div className="glass-card p-5 rounded-2xl relative overflow-hidden transition-all duration-300 hover:border-white/10 group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-500/10 transition-colors" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-400">Urgent Tasks</span>
          <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
            <BarChart3 className="h-5 w-5" />
          </div>
        </div>
        <div className="text-3xl font-bold font-outfit text-rose-500">{highPriority}</div>
        <div className="text-xs text-slate-500 mt-1">Pending & High Priority</div>
      </div>
    </div>
  );
};
