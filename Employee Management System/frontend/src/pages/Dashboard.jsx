import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
    Users, Clock, CalendarRange, Building2, Laptop, Megaphone,
    CheckCircle, LogOut, Plus, TrendingUp, Activity,
    AlertCircle, ChevronRight, Calendar, Star
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

// --- Color Maps to prevent Tailwind purging ---
const colorMap = {
    'indigo': {
        border: 'border-indigo-300', bg: 'bg-indigo-500', text: 'text-indigo-600',
        lightBg: 'bg-indigo-50', hover: 'hover:border-indigo-400',
        statIconText: 'text-indigo-500', statIconBg: 'bg-indigo-50'
    },
    'emerald': {
        border: 'border-emerald-300', bg: 'bg-emerald-500', text: 'text-emerald-600',
        lightBg: 'bg-emerald-50', hover: 'hover:border-emerald-400',
        statIconText: 'text-emerald-500', statIconBg: 'bg-emerald-50'
    },
    'amber': {
        border: 'border-amber-300', bg: 'bg-amber-500', text: 'text-amber-600',
        lightBg: 'bg-amber-50', hover: 'hover:border-amber-400',
        statIconText: 'text-amber-500', statIconBg: 'bg-amber-50'
    },
    'purple': {
        border: 'border-purple-300', bg: 'bg-purple-500', text: 'text-purple-600',
        lightBg: 'bg-purple-50', hover: 'hover:border-purple-400',
        statIconText: 'text-purple-500', statIconBg: 'bg-purple-50'
    },
    'blue': {
        border: 'border-blue-300', bg: 'bg-blue-500', text: 'text-blue-600',
        lightBg: 'bg-blue-50', hover: 'hover:border-blue-400',
        statIconText: 'text-blue-500', statIconBg: 'bg-blue-50'
    },
    'rose': {
        border: 'border-rose-300', bg: 'bg-rose-500', text: 'text-rose-600',
        lightBg: 'bg-rose-50', hover: 'hover:border-rose-400',
        statIconText: 'text-rose-500', statIconBg: 'bg-rose-50'
    },
    'cyan': {
        border: 'border-cyan-300', bg: 'bg-cyan-500', text: 'text-cyan-600',
        lightBg: 'bg-cyan-50', hover: 'hover:border-cyan-400',
        statIconText: 'text-cyan-500', statIconBg: 'bg-cyan-50'
    },
    'slate': {
        border: 'border-slate-300', bg: 'bg-slate-500', text: 'text-slate-600',
        lightBg: 'bg-slate-50', hover: 'hover:border-slate-400',
        statIconText: 'text-slate-500', statIconBg: 'bg-slate-50'
    }
};

// --- Reusable stat card ---
const StatCard = ({ icon: Icon, label, value, theme = 'indigo', sub, trend }) => {
    const colors = colorMap[theme] || colorMap['indigo'];
    return (
        <div className={`relative overflow-hidden bg-white rounded-2xl p-6 shadow-sm border border-slate-100 group hover:shadow-md transition-all duration-300 hover:-translate-y-0.5`}>
            <div className={`absolute top-0 right-0 w-28 h-28 rounded-full opacity-5 -mr-6 -mt-6 ${colors.bg}`} />
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">{value ?? '—'}</p>
                    {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
                </div>
                <div className={`p-3 rounded-xl ${colors.statIconBg}`}>
                    <Icon size={22} className={colors.statIconText} />
                </div>
            </div>
            {trend !== undefined && (
                <div className="mt-3 flex items-center text-xs font-medium text-emerald-600">
                    <TrendingUp size={12} className="mr-1" />
                    {trend}
                </div>
            )}
        </div>
    );
};

// --- Quick Action button ---
const QuickAction = ({ icon: Icon, label, onClick, theme = 'indigo' }) => {
    const colors = colorMap[theme] || colorMap['indigo'];
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed ${colors.border} hover:border-solid transition-all duration-200 group hover:shadow-md hover:-translate-y-0.5`}
        >
            <div className={`p-2.5 rounded-lg ${colors.lightBg}`}>
                <Icon size={20} className={colors.text} />
            </div>
            <span className="text-xs font-semibold text-slate-600">{label}</span>
        </button>
    );
};

// --- Greeting helper ---
const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
};

// --- Role badge colors ---
const roleBadgeClass = {
    'Super Admin': 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    'HR': 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    'HR Admin': 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    'Manager': 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    'Employee': 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
};

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [checkinLoading, setCheckinLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [summaryRes, annRes] = await Promise.all([
                api.get('/dashboard/summary'),
                api.get('/announcements'),
            ]);
            if (summaryRes.data.success) setSummary(summaryRes.data.data);
            if (annRes.data.success) setAnnouncements(annRes.data.data.slice(0, 3));
        } catch {
            // silently fail - dashboard should still render without data
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleCheckIn = async () => {
        setCheckinLoading(true);
        try {
            const device_info = navigator.userAgent;
            let location = null;
            
            if (navigator.geolocation) {
                try {
                    const pos = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
                    });
                    location = `${pos.coords.latitude}, ${pos.coords.longitude}`;
                } catch (e) {
                    location = 'Unavailable';
                }
            } else {
                location = 'Not Supported';
            }

            const res = await api.post('/attendance/check-in', { device_info, location });
            showToast(res.data.message);
            fetchData();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to check in', 'error');
        } finally {
            setCheckinLoading(false);
        }
    };

    const handleCheckOut = async () => {
        setCheckinLoading(true);
        try {
            const res = await api.post('/attendance/check-out');
            showToast(res.data.message);
            fetchData();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to check out', 'error');
        } finally {
            setCheckinLoading(false);
        }
    };

    const isAdmin = ['Super Admin', 'HR', 'HR Admin'].includes(user?.role);
    const isManager = user?.role === 'Manager';
    const isPrivileged = isAdmin || isManager;

    const todayStatus = summary?.today_status;
    const checkedInToday = !!todayStatus?.check_in;
    const checkedOutToday = !!todayStatus?.check_out;

    // Format attendance trend for chart
    const attendanceTrendData = (summary?.attendance_trend || []).map(d => ({
        day: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        count: parseInt(d.count),
    }));

    // Format dept distribution for pie chart
    const deptData = (summary?.dept_distribution || []).map(d => ({
        name: d.department,
        value: parseInt(d.count),
    }));

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white text-sm font-medium transition-all animate-slide-in ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                    {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                    {toast.message}
                </div>
            )}

            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-8 text-white shadow-2xl">
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <p className="text-indigo-200 text-sm font-medium mb-1">{getGreeting()},</p>
                        <h1 className="text-3xl font-bold mb-2">{user?.email?.split('@')[0] || 'User'} 👋</h1>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${roleBadgeClass[user?.role] || roleBadgeClass['Employee']}`}>
                                {user?.role}
                            </span>
                            <span className="text-indigo-200 text-sm flex items-center gap-1">
                                <Calendar size={14} />
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </span>
                        </div>
                    </div>

                    {/* Today's Attendance Status */}
                    {user?.role !== 'Super Admin' && (
                        <div className="flex flex-col sm:flex-row gap-3">
                            {!checkedInToday ? (
                                <button
                                    onClick={handleCheckIn}
                                    disabled={checkinLoading}
                                    className="flex items-center gap-2 bg-white text-indigo-700 px-5 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl disabled:opacity-60"
                                >
                                    <CheckCircle size={20} />
                                    {checkinLoading ? 'Checking In...' : 'Check In'}
                                </button>
                            ) : !checkedOutToday ? (
                                <button
                                    onClick={handleCheckOut}
                                    disabled={checkinLoading}
                                    className="flex items-center gap-2 bg-amber-400 text-amber-900 px-5 py-3 rounded-xl font-bold hover:bg-amber-300 transition-all shadow-lg disabled:opacity-60"
                                >
                                    <LogOut size={20} />
                                    {checkinLoading ? 'Checking Out...' : 'Check Out'}
                                </button>
                            ) : (
                                <div className="flex items-center gap-2 bg-white/20 text-white px-5 py-3 rounded-xl font-semibold">
                                    <Star size={18} className="text-amber-300" />
                                    Day Complete! Great work.
                                </div>
                            )}
                            {checkedInToday && (
                                <div className="flex flex-col justify-center bg-white/10 px-4 py-2 rounded-xl text-center">
                                    <span className="text-indigo-200 text-xs">Checked in at</span>
                                    <span className="font-bold text-sm">{new Date(todayStatus.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    {todayStatus.check_out && (
                                        <>
                                            <span className="text-indigo-200 text-xs mt-1">Checked out at</span>
                                            <span className="font-bold text-sm">{new Date(todayStatus.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* --- ADMIN/HR Stats Row --- */}
            {isAdmin && !loading && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard icon={Users} label="Total Employees" value={summary?.total_employees} theme="indigo" sub="Active workforce" trend="Active & growing" />
                    <StatCard icon={Clock} label="Today's Attendance" value={summary?.today_attendance} theme="emerald" sub="Checked in today" />
                    <StatCard icon={CalendarRange} label="Pending Leaves" value={summary?.pending_leaves} theme="amber" sub="Awaiting approval" />
                    <StatCard icon={Building2} label="Departments" value={summary?.total_departments} theme="purple" sub="Company structure" />
                </div>
            )}

            {/* --- MANAGER Stats Row --- */}
            {isManager && !loading && (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard icon={Users} label="Total Employees" value={summary?.total_employees} theme="indigo" sub="Company-wide" />
                    <StatCard icon={Clock} label="Today's Attendance" value={summary?.today_attendance} theme="emerald" sub="Present today" />
                    <StatCard icon={CalendarRange} label="Pending Leaves" value={summary?.pending_leaves} theme="amber" sub="Needs review" />
                </div>
            )}

            {/* --- EMPLOYEE Personal Stats --- */}
            {!isAdmin && !isManager && !loading && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard icon={Clock} label="Days Present (Month)" value={summary?.my_attendance_this_month} theme="emerald" sub={`As of ${new Date().toLocaleDateString('en-US', { month: 'long' })}`} />
                    <StatCard icon={CalendarRange} label="Pending Leaves" value={summary?.my_leaves?.Pending || 0} theme="amber" sub="Awaiting approval" />
                    <StatCard icon={CheckCircle} label="Approved Leaves" value={summary?.my_leaves?.Approved || 0} theme="indigo" sub="This year" />
                    <StatCard icon={Laptop} label="Assets Assigned" value={summary?.my_assets || 0} theme="purple" sub="Company assets" />
                </div>
            )}

            {/* Main grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* LEFT: Charts (admin/manager) or Quick Actions (employee) */}
                <div className="xl:col-span-2 space-y-6">

                    {/* Attendance Trend Chart — admin/manager */}
                    {isPrivileged && attendanceTrendData.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">Attendance Trend</h2>
                                    <p className="text-sm text-slate-500">Last 7 days check-ins</p>
                                </div>
                                <div className="p-2 bg-indigo-50 rounded-lg">
                                    <Activity size={18} className="text-indigo-600" />
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={attendanceTrendData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="attendGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                                    <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5} fill="url(#attendGradient)" dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Department Distribution — admin */}
                    {isAdmin && deptData.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">Headcount by Department</h2>
                                    <p className="text-sm text-slate-500">Active employees distribution</p>
                                </div>
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <Building2 size={18} className="text-purple-600" />
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row items-center gap-4">
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie data={deptData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                                            {deptData.map((_, i) => (
                                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                                        <Legend formatter={(value) => <span className="text-xs text-slate-600">{value}</span>} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Quick Actions — ALL users */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {user?.role !== 'Super Admin' && !checkedInToday && (
                                <QuickAction icon={CheckCircle} label="Check In" onClick={handleCheckIn} theme="emerald" />
                            )}
                            {user?.role !== 'Super Admin' && checkedInToday && !checkedOutToday && (
                                <QuickAction icon={LogOut} label="Check Out" onClick={handleCheckOut} theme="amber" />
                            )}
                            <QuickAction icon={CalendarRange} label="Apply Leave" onClick={() => navigate('/leave')} theme="indigo" />
                            <QuickAction icon={Clock} label="My Attendance" onClick={() => navigate('/attendance')} theme="blue" />
                            {isAdmin && (
                                <QuickAction icon={Plus} label="Add Employee" onClick={() => navigate('/employees/add')} theme="purple" />
                            )}
                            {isAdmin && (
                                <QuickAction icon={Megaphone} label="Announcement" onClick={() => navigate('/announcements')} theme="rose" />
                            )}
                            {isPrivileged && (
                                <QuickAction icon={Laptop} label="Assets" onClick={() => navigate('/assets')} theme="cyan" />
                            )}
                            <QuickAction icon={Users} label="Employees" onClick={() => navigate('/employees')} theme="slate" />
                        </div>
                    </div>

                    {/* Recent Activity — admin only */}
                    {isAdmin && (summary?.recent_activity || []).length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Activity</h2>
                            <div className="space-y-3">
                                {summary.recent_activity.map((act, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                            <Activity size={14} className="text-indigo-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-700 capitalize">
                                                <span className="text-indigo-600">{act.action}</span>
                                            </p>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                by {act.user_email} · {new Date(act.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT: Announcements */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-rose-50 rounded-lg">
                                    <Megaphone size={16} className="text-rose-500" />
                                </div>
                                <h2 className="text-lg font-bold text-slate-800">Announcements</h2>
                            </div>
                            <button
                                onClick={() => navigate('/announcements')}
                                className="text-xs text-indigo-600 font-medium flex items-center hover:text-indigo-800 transition-colors"
                            >
                                View all <ChevronRight size={14} />
                            </button>
                        </div>

                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : announcements.length > 0 ? (
                            <div className="space-y-3">
                                {announcements.map((ann, i) => (
                                    <div key={ann.id} className={`p-4 rounded-xl border transition-all hover:shadow-sm cursor-default ${i === 0 ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
                                        <h3 className="font-semibold text-slate-800 text-sm mb-1 line-clamp-1">{ann.title}</h3>
                                        <p className="text-slate-500 text-xs mb-2 line-clamp-2">{ann.content}</p>
                                        <div className="flex items-center text-xs text-slate-400 font-medium">
                                            <Calendar size={12} className="mr-1" />
                                            {new Date(ann.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                                <Megaphone size={36} className="mb-3 opacity-30" />
                                <p className="text-sm">No recent announcements</p>
                            </div>
                        )}
                    </div>

                    {/* Personal leave summary */}
                    {summary?.my_leaves && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <h2 className="text-lg font-bold text-slate-800 mb-5">My Leave Summary</h2>
                            <div className="space-y-3">
                                {[
                                    { label: 'Pending', color: 'bg-amber-500', value: summary.my_leaves.Pending || 0 },
                                    { label: 'Approved', color: 'bg-emerald-500', value: summary.my_leaves.Approved || 0 },
                                    { label: 'Rejected', color: 'bg-red-500', value: summary.my_leaves.Rejected || 0 },
                                ].map(({ label, color, value }) => (
                                    <div key={label} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                                            <span className="text-sm text-slate-600">{label}</span>
                                        </div>
                                        <span className="text-sm font-bold text-slate-800">{value}</span>
                                    </div>
                                ))}
                                <div className="pt-3 border-t border-slate-100">
                                    <button onClick={() => navigate('/leave')} className="w-full text-center text-sm text-indigo-600 font-semibold hover:text-indigo-800 transition-colors flex items-center justify-center gap-1">
                                        Manage Leave <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Asset info */}
                    {summary?.my_assets !== undefined && (
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
                            <div className="flex items-center gap-2 mb-3">
                                <Laptop size={18} className="text-indigo-300" />
                                <h2 className="font-bold">My Assets</h2>
                            </div>
                            <p className="text-4xl font-bold mb-1">{summary.my_assets}</p>
                            <p className="text-slate-400 text-sm">Company assets assigned to you</p>
                            <button onClick={() => navigate('/assets')} className="mt-4 text-indigo-300 text-sm font-medium flex items-center hover:text-white transition-colors">
                                View details <ChevronRight size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
