import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Clock, CheckCircle, LogOut } from 'lucide-react';

export const Attendance = () => {
    const { user } = useAuth();
    const [attendanceLogs, setAttendanceLogs] = useState([]);
    const [viewMode, setViewMode] = useState('my'); // 'my' or 'all'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isPrivileged = ['Super Admin', 'HR Admin', 'HR', 'Manager'].includes(user?.role);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const endpoint = viewMode === 'my' ? '/attendance/my' : '/attendance/all';
            const response = await api.get(endpoint);
            if (response.data.success) {
                setAttendanceLogs(response.data.data);
            }
        } catch (err) {
            setError('Failed to fetch attendance records');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, [viewMode]);

    const handleCheckIn = async () => {
        try {
            const response = await api.post('/attendance/check-in');
            if (response.data.success) {
                alert(response.data.message);
                fetchAttendance();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to check in');
        }
    };

    const handleCheckOut = async () => {
        try {
            const response = await api.post('/attendance/check-out');
            if (response.data.success) {
                alert(response.data.message);
                fetchAttendance();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to check out');
        }
    };

    const formatTime = (datetimeStr) => {
        if (!datetimeStr) return '-';
        return new Date(datetimeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Attendance</h1>
                    <p className="text-slate-500 mt-1">Track daily check-ins and check-outs</p>
                </div>
                <div className="flex space-x-3">
                    <button 
                        onClick={handleCheckIn}
                        className="flex items-center space-x-2 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors shadow-sm font-medium"
                    >
                        <CheckCircle size={20} />
                        <span>Check In</span>
                    </button>
                    <button 
                        onClick={handleCheckOut}
                        className="flex items-center space-x-2 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors shadow-sm font-medium"
                    >
                        <LogOut size={20} />
                        <span>Check Out</span>
                    </button>
                </div>
            </div>

            {isPrivileged && (
                <div className="mb-6 flex space-x-2 border-b border-slate-200">
                    <button
                        onClick={() => setViewMode('my')}
                        className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                            viewMode === 'my' 
                            ? 'border-indigo-600 text-indigo-600' 
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        My Attendance
                    </button>
                    <button
                        onClick={() => setViewMode('all')}
                        className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                            viewMode === 'all' 
                            ? 'border-indigo-600 text-indigo-600' 
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Company Attendance
                    </button>
                </div>
            )}

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading attendance data...</div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                                <th className="p-4">Date</th>
                                {viewMode === 'all' && (
                                    <>
                                        <th className="p-4">Employee Code</th>
                                        <th className="p-4">Name</th>
                                    </>
                                )}
                                <th className="p-4">Check In</th>
                                <th className="p-4">Check Out</th>
                                <th className="p-4">Total Hours</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendanceLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={viewMode === 'all' ? 7 : 5} className="p-8 text-center text-slate-500">
                                        No attendance records found.
                                    </td>
                                </tr>
                            ) : (
                                attendanceLogs.map((log) => (
                                    <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="p-4 font-medium text-slate-700">
                                            {new Date(log.date).toLocaleDateString()}
                                        </td>
                                        {viewMode === 'all' && (
                                            <>
                                                <td className="p-4 text-slate-600">{log.employee_code}</td>
                                                <td className="p-4 text-slate-800">{log.first_name} {log.last_name}</td>
                                            </>
                                        )}
                                        <td className="p-4 text-slate-600">{formatTime(log.check_in)}</td>
                                        <td className="p-4 text-slate-600">{formatTime(log.check_out)}</td>
                                        <td className="p-4 font-medium text-slate-700">{log.total_hours || '-'} hrs</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                log.status === 'Present' ? 'bg-emerald-100 text-emerald-700' :
                                                log.status === 'Half Day' ? 'bg-amber-100 text-amber-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
