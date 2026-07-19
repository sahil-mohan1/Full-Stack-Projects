import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    Users, 
    Building2, 
    Briefcase, 
    LogOut,
    Clock,
    CalendarRange
} from 'lucide-react';

export const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Employees', path: '/employees', icon: <Users size={20} /> },
        { name: 'Departments', path: '/departments', icon: <Building2 size={20} /> },
        { name: 'Designations', path: '/designations', icon: <Briefcase size={20} /> },
        { name: 'Attendance', path: '/attendance', icon: <Clock size={20} /> },
        { name: 'Leave', path: '/leave', icon: <CalendarRange size={20} /> }
    ];

    return (
        <div className="flex flex-col w-64 h-screen bg-slate-900 text-white shadow-xl">
            <div className="flex items-center justify-center h-20 border-b border-slate-800">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">EMS Pro</h1>
            </div>
            
            <div className="p-4 border-b border-slate-800">
                <p className="text-sm text-slate-400">Logged in as:</p>
                <p className="font-semibold">{user?.email}</p>
                <p className="text-xs px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded-full inline-block mt-2">
                    {user?.role}
                </p>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        to={item.path}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                            isActive(item.path)
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                    >
                        {item.icon}
                        <span className="font-medium">{item.name}</span>
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={logout}
                    className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};
