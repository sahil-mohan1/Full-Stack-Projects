import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { CalendarRange, Plus, Check, X } from 'lucide-react';

export const Leave = () => {
    const { user } = useAuth();
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [viewMode, setViewMode] = useState('my'); // 'my' or 'all'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [formData, setFormData] = useState({
        leave_type: 'Sick',
        start_date: '',
        end_date: '',
        reason: ''
    });

    const isPrivileged = ['Super Admin', 'HR Admin', 'HR', 'Manager'].includes(user?.role);

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            const endpoint = viewMode === 'my' ? '/leave/my' : '/leave/all';
            const response = await api.get(endpoint);
            if (response.data.success) {
                setLeaveRequests(response.data.data);
            }
        } catch (err) {
            setError('Failed to fetch leave requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, [viewMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/leave/apply', formData);
            if (response.data.success) {
                setIsModalOpen(false);
                setFormData({ leave_type: 'Sick', start_date: '', end_date: '', reason: '' });
                fetchLeaves();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit leave request');
        }
    };

    const handleUpdateStatus = async (id, status) => {
        if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this leave request?`)) return;
        
        try {
            const response = await api.put(`/leave/${id}/status`, { status });
            if (response.data.success) {
                fetchLeaves();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Leave Management</h1>
                    <p className="text-slate-500 mt-1">Manage your time off requests</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
                >
                    <Plus size={20} />
                    <span>Apply Leave</span>
                </button>
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
                        My Leaves
                    </button>
                    <button
                        onClick={() => setViewMode('all')}
                        className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                            viewMode === 'all' 
                            ? 'border-indigo-600 text-indigo-600' 
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Team Leaves
                    </button>
                </div>
            )}

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading leave requests...</div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                                {viewMode === 'all' && (
                                    <>
                                        <th className="p-4">Employee</th>
                                    </>
                                )}
                                <th className="p-4">Leave Type</th>
                                <th className="p-4">Duration</th>
                                <th className="p-4">Reason</th>
                                <th className="p-4">Status</th>
                                {viewMode === 'all' && <th className="p-4 text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {leaveRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={viewMode === 'all' ? 6 : 4} className="p-8 text-center text-slate-500">
                                        No leave requests found.
                                    </td>
                                </tr>
                            ) : (
                                leaveRequests.map((leave) => (
                                    <tr key={leave.id} className="border-b border-slate-100 hover:bg-slate-50">
                                        {viewMode === 'all' && (
                                            <td className="p-4 text-slate-800 font-medium">
                                                {leave.first_name} {leave.last_name}
                                                <div className="text-xs text-slate-500 font-normal">{leave.employee_code}</div>
                                            </td>
                                        )}
                                        <td className="p-4 font-medium text-slate-700">{leave.leave_type}</td>
                                        <td className="p-4 text-slate-600">
                                            {new Date(leave.start_date).toLocaleDateString()} <br/>to<br/> {new Date(leave.end_date).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-slate-600 max-w-xs truncate" title={leave.reason}>{leave.reason}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                leave.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                                                leave.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                                leave.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-slate-100 text-slate-700'
                                            }`}>
                                                {leave.status}
                                            </span>
                                        </td>
                                        {viewMode === 'all' && (
                                            <td className="p-4 text-right">
                                                {leave.status === 'Pending' && (
                                                    <div className="flex justify-end space-x-2">
                                                        <button 
                                                            onClick={() => handleUpdateStatus(leave.id, 'Approved')}
                                                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                            title="Approve"
                                                        >
                                                            <Check size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleUpdateStatus(leave.id, 'Rejected')}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Reject"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Apply Leave Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h2 className="text-xl font-bold text-slate-800">Apply for Leave</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Leave Type</label>
                                <select 
                                    value={formData.leave_type}
                                    onChange={(e) => setFormData({...formData, leave_type: e.target.value})}
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    required
                                >
                                    <option value="Sick">Sick Leave</option>
                                    <option value="Casual">Casual Leave</option>
                                    <option value="Earned">Earned Leave</option>
                                    <option value="Maternity">Maternity Leave</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                                    <input 
                                        type="date" 
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                                    <input 
                                        type="date" 
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                                <textarea 
                                    value={formData.reason}
                                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    rows="3"
                                    placeholder="Please provide a brief reason"
                                    required
                                ></textarea>
                            </div>
                            <div className="pt-4 flex space-x-3">
                                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                                    Submit Request
                                </button>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-white text-slate-700 border border-slate-300 py-2 rounded-lg hover:bg-slate-50 transition-colors font-medium">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
