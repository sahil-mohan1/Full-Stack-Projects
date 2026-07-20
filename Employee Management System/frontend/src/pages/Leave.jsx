import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { CalendarRange, Plus, Check, X, AlertCircle, CheckCircle } from 'lucide-react';

const Toast = ({ message, type }) => (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white text-sm font-medium animate-slide-in ${type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
        {type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
        {message}
    </div>
);

const leaveTypeColors = {
    Sick: 'bg-rose-100 text-rose-700',
    Casual: 'bg-blue-100 text-blue-700',
    Earned: 'bg-indigo-100 text-indigo-700',
    Maternity: 'bg-pink-100 text-pink-700',
    'Comp-Off': 'bg-emerald-100 text-emerald-700',
};

export const Leave = () => {
    const { user } = useAuth();
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [viewMode, setViewMode] = useState('my');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        leave_type: 'Sick',
        start_date: '',
        end_date: '',
        half_day: 'None',
        reason: '',
        document: null
    });

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const isPrivileged = ['Super Admin', 'HR Admin', 'HR', 'Manager'].includes(user?.role);

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            const endpoint = viewMode === 'my' ? '/leave/my' : '/leave/all';
            const response = await api.get(endpoint);
            if (response.data.success) setLeaveRequests(response.data.data);
        } catch {
            setError('Failed to fetch leave requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLeaves(); }, [viewMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const data = new FormData();
            data.append('leave_type', formData.leave_type);
            data.append('start_date', formData.start_date);
            data.append('end_date', formData.end_date);
            data.append('half_day', formData.half_day);
            data.append('reason', formData.reason);
            if (formData.document) {
                data.append('document', formData.document);
            }

            const response = await api.post('/leave/apply', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.success) {
                setIsModalOpen(false);
                setFormData({ leave_type: 'Sick', start_date: '', end_date: '', half_day: 'None', reason: '', document: null });
                showToast('Leave request submitted successfully!');
                fetchLeaves();
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to submit leave request', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    
    const handleCancelLeave = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this leave request?')) return;
        try {
            const response = await api.put(`/leave/${id}/cancel`);
            if (response.data.success) {
                showToast('Leave request cancelled successfully');
                fetchLeaves();
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to cancel leave', 'error');
        }
    };

    const handleUpdateStatus = async (id, status) => {
        if (!window.confirm(`${status === 'Approved' ? 'Approve' : 'Reject'} this leave request?`)) return;
        try {
            const response = await api.put(`/leave/${id}/status`, { status });
            if (response.data.success) {
                showToast(`Leave request ${status.toLowerCase()} successfully`);
                fetchLeaves();
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to update status', 'error');
        }
    };

    const statusClasses = {
        Approved: 'bg-emerald-100 text-emerald-700',
        Pending: 'bg-amber-100 text-amber-700',
        Rejected: 'bg-red-100 text-red-700',
    };

    return (
        <div className="space-y-6">
            {toast && <Toast {...toast} />}

            {/* Header controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {isPrivileged ? (
                    <div className="flex border-b border-slate-200 gap-1">
                        {['my', 'all'].map(mode => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                                    viewMode === mode
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {mode === 'my' ? 'My Leaves' : 'Team Leaves'}
                            </button>
                        ))}
                    </div>
                ) : <div />}

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-sm font-semibold text-sm"
                >
                    <Plus size={18} />
                    Apply Leave
                </button>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">{error}</div>}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="p-6 space-y-3">
                        {[1,2,3,4,5].map(i => <div key={i} className="h-14 skeleton rounded-xl" />)}
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                {viewMode === 'all' && <th className="px-6 py-4">Employee</th>}
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Duration</th>
                                <th className="px-6 py-4">Reason & Docs</th>
                                <th className="px-6 py-4">Status</th>
                                {viewMode === 'all' && <th className="px-6 py-4 text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {leaveRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={viewMode === 'all' ? 6 : 4} className="px-6 py-12 text-center">
                                        <CalendarRange size={40} className="mx-auto mb-3 text-slate-200" />
                                        <p className="text-slate-500 text-sm">No leave requests found.</p>
                                    </td>
                                </tr>
                            ) : leaveRequests.map((leave) => (
                                <tr key={leave.id} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
                                    {viewMode === 'all' && (
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-slate-800 text-sm">{leave.first_name} {leave.last_name}</p>
                                            <p className="text-xs text-slate-400 font-mono">{leave.employee_code}</p>
                                        </td>
                                    )}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-start gap-1">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${leaveTypeColors[leave.leave_type] || 'bg-slate-100 text-slate-600'}`}>
                                                {leave.leave_type}
                                            </span>
                                            {leave.half_day && leave.half_day !== 'None' && leave.half_day !== '0' && (
                                                <span className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-md">{leave.half_day === '1' ? 'Half Day' : leave.half_day}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-600">
                                        <p className="font-medium">{new Date(leave.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                        {(!leave.half_day || leave.half_day === 'None' || leave.half_day === '0') && leave.start_date !== leave.end_date && (
                                            <p className="text-slate-400">to {new Date(leave.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs">
                                        <p className="truncate" title={leave.reason}>{leave.reason}</p>
                                        {leave.document_path && (
                                            <a href={`${import.meta.env.VITE_API_URL.replace('/api', '')}/${leave.document_path}`} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline mt-1 inline-block">
                                                📎 View Document
                                            </a>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusClasses[leave.status] || 'bg-slate-100 text-slate-600'}`}>
                                            {leave.status}
                                        </span>
                                    </td>
                                    {viewMode === 'all' && (
                                        <td className="px-6 py-4 text-right">
                                            {leave.status === 'Pending' && (
                                                <div className="flex justify-end gap-1.5">
                                                    <button
                                                        onClick={() => handleUpdateStatus(leave.id, 'Approved')}
                                                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                                                        title="Approve"
                                                    >
                                                        <Check size={14} /> Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(leave.id, 'Rejected')}
                                                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                                        title="Reject"
                                                    >
                                                        <X size={14} /> Reject
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Apply Leave Modal */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
                            <h2 className="text-lg font-bold text-slate-800">Apply for Leave</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Leave Type</label>
                                <select
                                    value={formData.leave_type}
                                    onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm bg-white"
                                    required
                                >
                                    <option value="Sick">Sick Leave</option>
                                    <option value="Casual">Casual Leave</option>
                                    <option value="Earned">Earned Leave</option>
                                    <option value="Maternity">Maternity Leave</option>
                                    <option value="Comp-Off">Comp-Off</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Half Day Request</label>
                                <select
                                    value={formData.half_day}
                                    onChange={(e) => {
                                        const newHalfDay = e.target.value;
                                        setFormData({ 
                                            ...formData, 
                                            half_day: newHalfDay,
                                            end_date: newHalfDay !== 'None' ? formData.start_date : formData.end_date
                                        });
                                    }}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm bg-white"
                                >
                                    <option value="None">None (Full Day)</option>
                                    <option value="First Half">First Half</option>
                                    <option value="Second Half">Second Half</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className={formData.half_day !== 'None' ? "col-span-2" : ""}>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{formData.half_day !== 'None' ? 'Date' : 'Start Date'}</label>
                                    <input
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ 
                                            ...formData, 
                                            start_date: e.target.value, 
                                            end_date: formData.half_day !== 'None' ? e.target.value : formData.end_date 
                                        })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                                        required
                                    />
                                </div>
                                {formData.half_day === 'None' && (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Date</label>
                                        <input
                                            type="date"
                                            value={formData.end_date}
                                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                                            required
                                        />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Reason</label>
                                <textarea
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm resize-none"
                                    rows="3"
                                    placeholder="Briefly describe the reason..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Supporting Document (Optional)</label>
                                <input
                                    type="file"
                                    onChange={(e) => setFormData({ ...formData, document: e.target.files[0] })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 file:cursor-pointer"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                />
                            </div>
                            <div className="flex gap-3 pt-2 shrink-0">
                                <button type="submit" disabled={submitting} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 transition-colors font-semibold text-sm disabled:opacity-60">
                                    {submitting ? 'Submitting...' : 'Submit Request'}
                                </button>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-medium text-sm">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
