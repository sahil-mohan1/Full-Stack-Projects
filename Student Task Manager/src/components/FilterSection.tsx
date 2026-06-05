import React from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

interface FilterSectionProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: 'All' | 'Pending' | 'Completed';
  setStatusFilter: (filter: 'All' | 'Pending' | 'Completed') => void;
  priorityFilter: 'All' | 'Low' | 'Medium' | 'High';
  setPriorityFilter: (filter: 'All' | 'Low' | 'Medium' | 'High') => void;
  sortBy: 'Newest' | 'Oldest' | 'Priority';
  setSortBy: (sort: 'Newest' | 'Oldest' | 'Priority') => void;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  sortBy,
  setSortBy,
}) => {
  return (
    <div className="glass-card p-5 rounded-2xl space-y-4 mb-6 relative overflow-hidden">
      {/* Search and Sort controls */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by task name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/60 border border-white/5 focus:border-indigo-500/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
          />
        </div>

        {/* Sort Select */}
        <div className="relative min-w-[180px]">
          <ArrowUpDown className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500 pointer-events-none" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'Newest' | 'Oldest' | 'Priority')}
            className="w-full bg-slate-950 border border-white/5 focus:border-indigo-500/80 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
          >
            <option value="Newest" className="bg-slate-950">Newest First</option>
            <option value="Oldest" className="bg-slate-950">Oldest First</option>
            <option value="Priority" className="bg-slate-950">Priority: High to Low</option>
          </select>
        </div>
      </div>

      {/* Tabs for filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-white/5">
        {/* Status filters */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-white/5 w-fit">
          {(['All', 'Pending', 'Completed'] as const).map((tab) => {
            const isActive = statusFilter === tab;
            return (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-indigo-glow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" />
            Priority:
          </span>
          <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-white/5">
            {(['All', 'Low', 'Medium', 'High'] as const).map((level) => {
              const isActive = priorityFilter === level;
              return (
                <button
                  key={level}
                  onClick={() => setPriorityFilter(level)}
                  className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all ${
                    isActive
                      ? level === 'Low' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        level === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        level === 'High' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
