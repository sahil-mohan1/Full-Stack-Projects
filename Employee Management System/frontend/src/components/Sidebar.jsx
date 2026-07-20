import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    Building2,
    Briefcase,
    LogOut,
    Clock,
    CalendarRange,
    Megaphone,
    Laptop,
    FileText,
    ChevronRight,
    CalendarDays,
    UserCog,
    Settings as SettingsIcon,
    Banknote,
    LineChart,
    UserPlus,
    Bell,
    BarChart,
} from 'lucide-react';

export const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname.startsWith(path) && (path !== '/' || location.pathname === '/');

    const allNavItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: null },
        { name: 'Employees', path: '/employees', icon: Users, roles: null },
        { name: 'Departments', path: '/departments', icon: Building2, roles: ['Super Admin', 'HR', 'HR Admin', 'Manager'] },
        { name: 'Designations', path: '/designations', icon: Briefcase, roles: ['Super Admin', 'HR', 'HR Admin'] },
        { name: 'Attendance', path: '/attendance', icon: Clock, roles: null },
        { name: 'Leave', path: '/leave', icon: CalendarRange, roles: null },
        { name: 'Shifts', path: '/shifts', icon: Clock, roles: ['Super Admin', 'HR', 'HR Admin'] },
        { name: 'Holidays', path: '/holidays', icon: CalendarDays, roles: null },
        { name: 'Announcements', path: '/announcements', icon: Megaphone, roles: ['Super Admin', 'HR', 'HR Admin'] },
        { name: 'Assets', path: '/assets', icon: Laptop, roles: ['Super Admin', 'HR', 'HR Admin', 'Manager'] },
        { name: 'Performance', path: '/performance', icon: LineChart, roles: null },
        { name: 'Recruitment', path: '/recruitment', icon: UserPlus, roles: ['Super Admin', 'HR', 'HR Admin'] },
        { name: 'Payroll', path: '/payroll', icon: Banknote, roles: ['Super Admin', 'HR', 'HR Admin'] },
        { name: 'Reports', path: '/reports', icon: BarChart, roles: ['Super Admin', 'HR', 'HR Admin', 'Manager'] },
        { name: 'Notifications', path: '/notifications', icon: Bell, roles: null },
        { name: 'User Management', path: '/users', icon: UserCog, roles: ['Super Admin'] },
        { name: 'Settings', path: '/settings', icon: SettingsIcon, roles: ['Super Admin'] },
        { name: 'Audit Logs', path: '/audit-logs', icon: FileText, roles: ['Super Admin'] },
    ];

    const navItems = allNavItems.filter(item =>
        !item.roles || item.roles.includes(user?.role)
    );

    // Role badge gradient
    const roleGradient = {
        'Super Admin': 'from-purple-500 to-indigo-500',
        'HR Admin': 'from-blue-500 to-cyan-500',
        'HR': 'from-blue-500 to-cyan-500',
        'Manager': 'from-amber-500 to-orange-500',
        'Employee': 'from-emerald-500 to-teal-500',
    };
    const avatarGrad = roleGradient[user?.role] || 'from-slate-500 to-slate-700';

    const initials = user?.email
        ? user.email.split('@')[0].slice(0, 2).toUpperCase()
        : 'U';

    return (
        <div className="flex flex-col w-64 h-screen bg-slate-900 text-white shadow-2xl flex-shrink-0">
            {/* Logo */}
            <div className="flex items-center justify-center h-[72px] border-b border-slate-800/80 px-6">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <Building2 size={16} className="text-white" />
                    </div>
                    <h1 className="text-xl font-extrabold tracking-tight">
                        <span className="text-white">EMS</span>
                        <span className="text-indigo-400"> Pro</span>
                    </h1>
                </div>
            </div>

            {/* User profile */}
            <div className="p-4 mx-3 my-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarGrad} flex items-center justify-center text-sm font-bold shadow-lg flex-shrink-0`}>
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                            {user?.email?.split('@')[0] || 'User'}
                        </p>
                        <span className={`text-xs px-2 py-0.5 bg-gradient-to-r ${avatarGrad} rounded-full font-medium inline-block mt-0.5`}>
                            {user?.role}
                        </span>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">Navigation</p>
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`group flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                                active
                                    ? 'nav-active text-white'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <Icon size={18} className={active ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400 transition-colors'} />
                                <span>{item.name}</span>
                            </div>
                            {active && <ChevronRight size={14} className="text-indigo-200 opacity-70" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-3 border-t border-slate-800/80">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );
};
