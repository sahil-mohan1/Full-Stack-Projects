import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, Users, Building2, UserCircle, 
    CalendarCheck, CalendarOff, LogOut, Menu, X, MonitorPlay, Megaphone, ShieldAlert,
    Clock, CalendarDays, Bell
} from 'lucide-react';

// Map routes to page titles
const pageTitles = {
    '/dashboard': { title: 'Dashboard', subtitle: 'Overview of your organization' },
    '/employees': { title: 'Employees', subtitle: 'Manage your workforce' },
    '/departments': { title: 'Departments', subtitle: 'Organizational structure' },
    '/designations': { title: 'Designations', subtitle: 'Job roles and positions' },
    '/attendance': { title: 'Attendance', subtitle: 'Track daily check-ins & check-outs' },
    '/leave': { title: 'Leave Management', subtitle: 'Manage time-off requests' },
    '/announcements': { title: 'Announcements', subtitle: 'Company-wide communications' },
    '/assets': { title: 'Asset Management', subtitle: 'Track company equipment' },
    '/audit-logs': { title: 'Audit Logs', subtitle: 'System activity trail' },
};

export const Layout = () => {
    const location = useLocation();
    const { user } = useAuth();

    // Find matching page info (also match sub-routes like /employees/123)
    const matchedKey = Object.keys(pageTitles).find(key =>
        location.pathname === key || location.pathname.startsWith(key + '/')
    );
    const pageInfo = matchedKey ? pageTitles[matchedKey] : { title: 'EMS Pro', subtitle: '' };

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="flex-shrink-0 h-[72px] bg-white/80 backdrop-blur-sm border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 leading-tight">{pageInfo.title}</h2>
                        {pageInfo.subtitle && (
                            <p className="text-xs text-slate-500 font-medium">{pageInfo.subtitle}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800">
                            <Bell size={20} />
                        </button>
                        <div className="h-8 w-px bg-slate-200" />
                        <div className="text-right">
                            <p className="text-sm font-semibold text-slate-700">{user?.email?.split('@')[0]}</p>
                            <p className="text-xs text-slate-400">{user?.role}</p>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
