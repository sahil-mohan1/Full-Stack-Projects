import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Clock, CheckCircle, LogOut, AlertCircle, Edit3, MessageSquare, Coffee } from 'lucide-react';

const Toast = ({ message, type }) => (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white text-sm font-medium animate-slide-in ${type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
        {type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
        {message}
    </div>
);

export const Attendance = () => {
    const { user } = useAuth();
    const [attendanceLogs, setAttendanceLogs] = useState([]);
    const [corrections, setCorrections] = useState([]);
    const [viewMode, setViewMode] = useState(user?.role === 'Super Admin' ? 'all' : 'my');
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    // Modals
    const [manualModal, setManualModal] = useState({ open: false, data: null });
    const [correctionModal, setCorrectionModal] = useState({ open: false, data: null });
    
    // Modal Form States
    const [manualForm, setManualForm] = useState({ check_in: '', check_out: '', status: 'Present', remarks: '' });
    const [correctionForm, setCorrectionForm] = useState({ check_in: '', check_out: '', reason: '' });

    const isPrivileged = ['Super Admin', 'HR Admin', 'HR', 'Manager'].includes(user?.role);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            if (viewMode === 'corrections') {
                const res = await api.get('/attendance/corrections');
                if (res.data.success) setCorrections(res.data.data);
            } else {
                const endpoint = viewMode === 'my' ? '/attendance/my' : '/attendance/all';
                const response = await api.get(endpoint);
                if (response.data.success) setAttendanceLogs(response.data.data);
            }
        } catch {
            showToast('Failed to fetch records', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAttendance(); }, [viewMode]);

    const handleAction = async (endpoint, method = 'post', data = {}) => {
        try {
            const res = await api[method](endpoint, data);
            if (res.data.success) {
                showToast(res.data.message);
                fetchAttendance();
            } else {
                showToast(res.data.message || 'Action failed', 'error');
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Action failed', 'error');
        }
    };

    const handleCheckIn = async () => {
        let location = 'Unavailable';
        if (navigator.geolocation) {
            try {
                const pos = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
                });
                location = `${pos.coords.latitude}, ${pos.coords.longitude}`;
            } catch (e) {}
        }
        handleAction('/attendance/check-in', 'post', { device_info: navigator.userAgent, location });
    };

    const submitManualAttendance = async (e) => {
        e.preventDefault();
        const payload = {
            employee_id: manualModal.data.employee_id || manualModal.data.id, 
            date: manualModal.data.date,
            ...manualForm
        };
        await handleAction('/attendance/manual', 'post', payload);
        setManualModal({ open: false, data: null });
    };

    const submitCorrection = async (e) => {
        e.preventDefault();
        const payload = { date: correctionModal.data.date, ...correctionForm };
        await handleAction('/attendance/corrections', 'post', payload);
        setCorrectionModal({ open: false, data: null });
    };

    const formatTime = (datetimeStr) => {
        if (!datetimeStr) return '—';
        return new Date(datetimeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="space-y-6 relative">
            {toast && <Toast {...toast} />}

            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {isPrivileged && user?.role !== 'Super Admin' ? (
                    <div className="flex border-b border-slate-200 gap-1">
                        {['my', 'all', 'corrections'].map(mode => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors capitalize ${
                                    viewMode === mode ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {mode.replace('-', ' ')}
                            </button>
                        ))}
                    </div>
                ) : user?.role === 'Super Admin' ? (
                    <div className="flex border-b border-slate-200 gap-1">
                        {['all', 'corrections'].map(mode => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors capitalize ${
                                    viewMode === mode ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {mode.replace('-', ' ')}
                            </button>
                        ))}
                    </div>
                ) : <div />}

                {viewMode === 'my' && (
                    <div className="flex items-center gap-2">
                        <button onClick={handleCheckIn} className="flex items-center gap-2 bg-emerald-500 text-white px-3 py-2 rounded-xl hover:bg-emerald-600 font-semibold text-sm">
                            <CheckCircle size={16} /> Check In
                        </button>
                        <button onClick={() => handleAction('/attendance/break/start')} className="flex items-center gap-2 bg-amber-500 text-white px-3 py-2 rounded-xl hover:bg-amber-600 font-semibold text-sm">
                            <Coffee size={16} /> Start Break
                        </button>
                        <button onClick={() => handleAction('/attendance/break/end')} className="flex items-center gap-2 bg-indigo-500 text-white px-3 py-2 rounded-xl hover:bg-indigo-600 font-semibold text-sm">
                            <Coffee size={16} /> End Break
                        </button>
                        <button onClick={() => handleAction('/attendance/check-out')} className="flex items-center gap-2 bg-slate-700 text-white px-3 py-2 rounded-xl hover:bg-slate-800 font-semibold text-sm">
                            <LogOut size={16} /> Check Out
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="p-6 space-y-3">
                        {[1,2,3].map(i => <div key={i} className="h-14 skeleton rounded-xl bg-slate-100" />)}
                    </div>
                ) : viewMode === 'corrections' ? (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                            <tr>
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Req. Check In</th>
                                <th className="px-6 py-4">Req. Check Out</th>
                                <th className="px-6 py-4">Reason</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {corrections.map(req => (
                                <tr key={req.id} className="border-b border-slate-50">
                                    <td className="px-6 py-4 font-medium text-sm">{req.first_name} {req.last_name}</td>
                                    <td className="px-6 py-4 text-sm">{req.date}</td>
                                    <td className="px-6 py-4 text-sm">{formatTime(req.requested_check_in)}</td>
                                    <td className="px-6 py-4 text-sm">{formatTime(req.requested_check_out)}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{req.reason}</td>
                                    <td className="px-6 py-4 text-sm font-semibold">{req.status}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        {req.status === 'Pending' && (
                                            <>
                                                <button onClick={() => handleAction(`/attendance/corrections/${req.id}/status`, 'put', {status:'Approved'})} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-200">Approve</button>
                                                <button onClick={() => handleAction(`/attendance/corrections/${req.id}/status`, 'put', {status:'Rejected'})} className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200">Reject</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                {viewMode === 'all' && <th className="px-6 py-4">Employee</th>}
                                <th className="px-6 py-4">Check In</th>
                                <th className="px-6 py-4">Check Out</th>
                                <th className="px-6 py-4">Breaks (m)</th>
                                <th className="px-6 py-4">Hours</th>
                                <th className="px-6 py-4">OT</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Remarks</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendanceLogs.map((log) => (
                                <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50">
                                    <td className="px-6 py-4 text-sm">{new Date(log.date).toLocaleDateString()}</td>
                                    {viewMode === 'all' && <td className="px-6 py-4 text-sm font-medium">{log.first_name} {log.last_name}</td>}
                                    <td className="px-6 py-4 text-sm">{formatTime(log.check_in)}</td>
                                    <td className="px-6 py-4 text-sm">{formatTime(log.check_out)}</td>
                                    <td className="px-6 py-4 text-sm font-mono text-amber-600">{log.total_break_duration || 0}m</td>
                                    <td className="px-6 py-4 text-sm font-bold">{log.total_hours || '—'}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-indigo-600">{log.overtime_hours > 0 ? `+${log.overtime_hours}h` : '—'}</td>
                                    <td className="px-6 py-4 text-xs font-bold">{log.status}</td>
                                    <td className="px-6 py-4 text-xs text-slate-500">{log.remarks || '—'}</td>
                                    <td className="px-6 py-4 text-right">
                                        {viewMode === 'my' ? (
                                            <button onClick={() => setCorrectionModal({ open: true, data: log })} className="text-indigo-600 hover:text-indigo-800 p-2"><MessageSquare size={16} /></button>
                                        ) : (
                                            <button onClick={() => {
                                                setManualForm({
                                                    check_in: log.check_in ? new Date(log.check_in).toISOString().slice(0, 16) : '',
                                                    check_out: log.check_out ? new Date(log.check_out).toISOString().slice(0, 16) : '',
                                                    status: log.status,
                                                    remarks: log.remarks || ''
                                                });
                                                setManualModal({ open: true, data: log });
                                            }} className="text-slate-600 hover:text-slate-800 p-2"><Edit3 size={16} /></button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Manual Attendance Modal */}
            {manualModal.open && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                        <h2 className="text-xl font-bold mb-4">Manual Attendance</h2>
                        <form onSubmit={submitManualAttendance} className="space-y-4">
                            <div><label className="text-xs font-bold text-slate-500 mb-1 block">Check In</label><input type="datetime-local" className="w-full border rounded-xl px-4 py-2 text-sm" value={manualForm.check_in} onChange={e => setManualForm({...manualForm, check_in: e.target.value})} /></div>
                            <div><label className="text-xs font-bold text-slate-500 mb-1 block">Check Out</label><input type="datetime-local" className="w-full border rounded-xl px-4 py-2 text-sm" value={manualForm.check_out} onChange={e => setManualForm({...manualForm, check_out: e.target.value})} /></div>
                            <div><label className="text-xs font-bold text-slate-500 mb-1 block">Status</label><select className="w-full border rounded-xl px-4 py-2 text-sm" value={manualForm.status} onChange={e => setManualForm({...manualForm, status: e.target.value})}><option>Present</option><option>Absent</option><option>Half Day</option><option>Holiday</option><option>Late</option><option>Early Exit</option></select></div>
                            <div><label className="text-xs font-bold text-slate-500 mb-1 block">Remarks</label><input type="text" className="w-full border rounded-xl px-4 py-2 text-sm" value={manualForm.remarks} onChange={e => setManualForm({...manualForm, remarks: e.target.value})} required /></div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setManualModal({open: false, data: null})} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Request Correction Modal */}
            {correctionModal.open && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                        <h2 className="text-xl font-bold mb-4">Request Correction</h2>
                        <form onSubmit={submitCorrection} className="space-y-4">
                            <div><label className="text-xs font-bold text-slate-500 mb-1 block">Requested Check In</label><input type="datetime-local" className="w-full border rounded-xl px-4 py-2 text-sm" value={correctionForm.check_in} onChange={e => setCorrectionForm({...correctionForm, check_in: e.target.value})} /></div>
                            <div><label className="text-xs font-bold text-slate-500 mb-1 block">Requested Check Out</label><input type="datetime-local" className="w-full border rounded-xl px-4 py-2 text-sm" value={correctionForm.check_out} onChange={e => setCorrectionForm({...correctionForm, check_out: e.target.value})} /></div>
                            <div><label className="text-xs font-bold text-slate-500 mb-1 block">Reason</label><textarea className="w-full border rounded-xl px-4 py-2 text-sm h-24" placeholder="Forgot to punch in..." value={correctionForm.reason} onChange={e => setCorrectionForm({...correctionForm, reason: e.target.value})} required /></div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setCorrectionModal({open: false, data: null})} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700">Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
