import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { CalendarDays, Plus, Pencil, Trash2, X, AlertCircle, CheckCircle } from 'lucide-react';

const Toast = ({ message, type }) => (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white text-sm font-medium animate-slide-in ${type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
        {type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
        {message}
    </div>
);

export const Holidays = () => {
    const { user } = useAuth();
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({ id: null, name: '', date: '', type: 'Public' });

    const isPrivileged = ['Super Admin', 'HR Admin', 'HR'].includes(user?.role);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchHolidays = async () => {
        setLoading(true);
        try {
            const res = await api.get('/holidays');
            if (res.data.success) setHolidays(res.data.data);
        } catch {
            showToast('Failed to fetch holidays', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchHolidays(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (formData.id) {
                await api.put(`/holidays/${formData.id}`, formData);
                showToast('Holiday updated successfully');
            } else {
                await api.post('/holidays', formData);
                showToast('Holiday created successfully');
            }
            setIsModalOpen(false);
            fetchHolidays();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to save holiday', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this holiday?')) return;
        try {
            await api.delete(`/holidays/${id}`);
            showToast('Holiday deleted successfully');
            fetchHolidays();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to delete holiday', 'error');
        }
    };

    const openModal = (holiday = null) => {
        if (holiday) {
            setFormData({ ...holiday });
        } else {
            setFormData({ id: null, name: '', date: '', type: 'Public' });
        }
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            {toast && <Toast {...toast} />}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Holiday Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Configure company-wide holidays.</p>
                </div>
                {isPrivileged && (
                    <button onClick={() => openModal()} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-sm font-semibold text-sm">
                        <Plus size={18} /> Add Holiday
                    </button>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="p-6 space-y-3">
                        {[1,2,3,4].map(i => <div key={i} className="h-14 skeleton rounded-xl" />)}
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Holiday Name</th>
                                <th className="px-6 py-4">Type</th>
                                {isPrivileged && <th className="px-6 py-4 text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {holidays.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <CalendarDays size={40} className="mx-auto mb-3 text-slate-200" />
                                        <p className="text-slate-500 text-sm">No holidays configured yet.</p>
                                    </td>
                                </tr>
                            ) : holidays.map((holiday) => (
                                <tr key={holiday.id} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                                        {new Date(holiday.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-800 font-semibold">{holiday.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${holiday.type === 'Public' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                                            {holiday.type}
                                        </span>
                                    </td>
                                    {isPrivileged && (
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => openModal(holiday)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                                    <Pencil size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(holiday.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {isModalOpen && createPortal(
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
                            <h2 className="text-lg font-bold text-slate-800">{formData.id ? 'Edit Holiday' : 'Add Holiday'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Holiday Name</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date</label>
                                <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Holiday Type</label>
                                <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white">
                                    <option value="Public">Public Holiday</option>
                                    <option value="Optional">Optional Holiday</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-2 shrink-0">
                                <button type="submit" disabled={submitting} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 font-semibold text-sm">
                                    {submitting ? 'Saving...' : 'Save Holiday'}
                                </button>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium text-sm">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>, document.body
            )}
        </div>
    );
};
