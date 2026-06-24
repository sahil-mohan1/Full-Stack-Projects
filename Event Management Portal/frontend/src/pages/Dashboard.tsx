import React, { useEffect } from 'react';
import { useNGO } from '../context/NGOContext';
import { StatCard } from '../components/StatCard';
import { Users, Calendar, Award, UserCheck, Activity, Heart } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { stats, fetchStats, events, volunteers } = useNGO();

  useEffect(() => {
    fetchStats();
  }, []);

  const latestEvents = events
    .filter(e => e.status === 'Upcoming' || e.status === 'Ongoing')
    .slice(0, 3);

  // Format activity timestamp
  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return timeStr;
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="flex-1 p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Top Banner */}
      <div className="glass-panel border border-slate-800/80 p-6 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-lg font-bold text-slate-100 flex items-center justify-center md:justify-start gap-2">
            NGO Impact Command Center
          </h3>
          <p className="text-xs text-slate-400 max-w-xl">
            Real-time tracking of community service campaigns, volunteer registrations, active enrollments, and regional community outreach drives.
          </p>
        </div>
        <div className="flex -space-x-2 shrink-0">
          {(() => {
            const sortedVols = [...volunteers].sort((a, b) => a.id - b.id);
            const displayVolunteers = sortedVols.slice(0, 3);
            const remainingCount = (stats?.totalVolunteers || 0) - displayVolunteers.length;
            
            return (
              <>
                {displayVolunteers.map((vol, index) => {
                  const initial = vol.name.charAt(0).toUpperCase();
                  const colors = ['text-emerald-400', 'text-indigo-400', 'text-purple-400'];
                  const colorClass = colors[index % colors.length];
                  return (
                    <div
                      key={vol.id}
                      className={`w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-850 flex items-center justify-center text-[10px] ${colorClass} font-bold`}
                    >
                      {initial}
                    </div>
                  );
                })}
                {remainingCount > 0 && (
                  <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-emerald-500 flex items-center justify-center text-[10px] text-white font-bold glow-emerald">
                    +{remainingCount}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>

      {/* Grid of StatCards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Registered Volunteers"
          value={stats?.totalVolunteers || 0}
          icon={Users}
          color="indigo"
          subtext="Total database records"
        />
        <StatCard
          title="Active Volunteers"
          value={stats?.activeVolunteers || 0}
          icon={UserCheck}
          color="emerald"
          subtext="Volunteers available for events"
        />
        <StatCard
          title="Total Campaigns"
          value={stats?.totalEvents || 0}
          icon={Calendar}
          color="purple"
          subtext="Total events created"
        />
        <StatCard
          title="Active Enrollments"
          value={stats?.totalRegistrations || 0}
          icon={Award}
          color="amber"
          subtext="Total volunteer seats joined"
        />
      </div>

      {/* Grid: Activity and Upcoming */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Registrations Table */}
        <div className="glass-panel border border-slate-800/80 rounded-2xl p-6 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-slate-100 tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Recent Activity Log</span>
            </h4>
            <span className="text-[10px] text-slate-500 font-semibold bg-slate-950 px-2 py-0.5 rounded border border-slate-900">
              Live Feed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800/60 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-2.5 pb-2 font-bold">Volunteer</th>
                  <th className="py-2.5 pb-2 font-bold">Event & Drive</th>
                  <th className="py-2.5 pb-2 font-bold text-right font-bold">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                  stats.recentActivities.map((activity, idx) => (
                    <tr key={idx} className="border-b border-slate-800/30 hover:bg-slate-900/10 transition-colors">
                      <td className="py-3 font-semibold text-slate-200">{activity.volunteer_name}</td>
                      <td className="py-3 text-slate-400">{activity.event_name}</td>
                      <td className="py-3 text-right text-slate-500 text-[10px]">{formatTime(activity.registered_at)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-550 italic">
                      No recent enrollment records.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Campaign Hotlist Summary */}
        <div className="glass-panel border border-slate-800/80 rounded-2xl p-6 space-y-4">
          <h4 className="text-sm font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <Heart className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span>Active Campaigns</span>
          </h4>

          <div className="space-y-4">
            {latestEvents.length > 0 ? (
              latestEvents.map((e) => {
                const filledPct = Math.min(100, Math.round((e.volunteers_joined / e.required_volunteers) * 100));
                return (
                  <div key={e.id} className="space-y-2 border-b border-slate-850 pb-3 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-slate-200 font-bold truncate pr-2">{e.name}</span>
                      <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        e.status === 'Upcoming' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {e.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                      <span>{e.location}</span>
                      <span>{filledPct}% filled</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${filledPct}%` }}
                        className="h-full bg-emerald-500 rounded-full"
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-550 italic text-xs py-8 text-center">
                No upcoming community service events.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
