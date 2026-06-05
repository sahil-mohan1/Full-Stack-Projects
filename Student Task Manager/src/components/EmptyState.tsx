import React from 'react';
import { Clipboard, SearchX } from 'lucide-react';

interface EmptyStateProps {
  isSearchOrFilterActive: boolean;
  onResetFilters?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  isSearchOrFilterActive, 
  onResetFilters 
}) => {
  return (
    <div className="glass-card rounded-2xl p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[320px] relative overflow-hidden animate-fade-in">
      {/* Glow backgrounds */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {isSearchOrFilterActive ? (
        <>
          <div className="p-4 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20 mb-4 shadow-amber-glow">
            <SearchX className="h-10 w-10 animate-bounce" style={{ animationDuration: '3s' }} />
          </div>
          <h3 className="text-lg font-bold font-outfit text-white mb-2">No Matching Tasks Found</h3>
          <p className="text-slate-400 text-sm max-w-sm mb-6">
            We couldn't find any tasks that match your current search queries or filter selections. Try adjusting your filters.
          </p>
          {onResetFilters && (
            <button
              onClick={onResetFilters}
              className="px-5 py-2.5 bg-slate-900 border border-white/10 hover:border-indigo-500/50 hover:bg-slate-800 text-slate-200 text-sm font-semibold rounded-xl transition-all"
            >
              Reset Filters
            </button>
          )}
        </>
      ) : (
        <>
          <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20 mb-4 shadow-indigo-glow">
            <Clipboard className="h-10 w-10 animate-pulse" />
          </div>
          <h3 className="text-lg font-bold font-outfit text-white mb-2">Your Taskboard is Empty</h3>
          <p className="text-slate-400 text-sm max-w-sm">
            You don't have any tasks right now. Create one using the form to start tracking your progress!
          </p>
        </>
      )}
    </div>
  );
};
