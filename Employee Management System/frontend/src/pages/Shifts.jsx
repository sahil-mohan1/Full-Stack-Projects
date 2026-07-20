import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Clock, Plus, Pencil, Trash2, X, AlertCircle, CheckCircle, Users } from 'lucide-react';

const Toast = ({ message, type }) => (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white text-sm font-medium animate-slide-in ${type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
        {type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
        {message}
    </div>
);

export const Shifts = () => {
    const { user } = useAuth();
    const [viewMode, setViewMode] = useState('configurations'); // 'configurations' or 'assignments'
    
    // Configurations state
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Assignments state
    const [employees, setEmployees] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [selectedShiftId, setSelectedShiftId] = useState('');
    
    const [toast, setToast] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({ id: null, name: '', start_time: '09:00', end_time: '18:00', grace_time: 15, weekly_off: 'Sunday', status: 'Active' });

    const isPrivileged = ['Super Admin', 'HR Admin', 'HR'].includes(user?.role);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const shiftRes = await api.get('/shifts');
            if (shiftRes.data.success) setShifts(shiftRes.data.data);
            
            if (viewMode === 'assignments') {
                const empRes = await api.get('/employees');
                if (empRes.data.success) setEmployees(empRes.data.data);
            }
        } catch {
            showToast('Failed to fetch data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [viewMode]);

    // Shift Configuration handlers
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (formData.id) {
                await api.put(`/shifts/${formData.id}`, formData);
                showToast('Shift updated successfully');
            } else {
                await api.post('/shifts', formData);
                showToast('Shift created successfully');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to save shift', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this shift?')) return;
        try {
            await api.delete(`/shifts/${id}`);
            showToast('Shift deleted successfully');
            fetchData();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to delete shift', 'error');
        }
    };

    const openModal = (shift = null) => {
        if (shift) {
            setFormData({ ...shift });
        } else {
            setFormData({ id: null, name: '', start_time: '09:00', end_time: '18:00', grace_time: 15, weekly_off: 'Sunday', status: 'Active' });
        }
        setIsModalOpen(true);
    };

    // Employee Assignment handlers
    const toggleEmployeeSelection = (id) => {
        setSelectedEmployees(prev => 
            prev.includes(id) ? prev.filter(empId => empId !== id) : [...prev, id]
        );
    };

    const toggleAllEmployees = (e) => {
        if (e.target.checked) {
            setSelectedEmployees(employees.map(emp => emp.id));
        } else {
            setSelectedEmployees([]);
        }
    };

    const handleBulkAssign = async () => {
        if (selectedEmployees.length === 0) {
            showToast('Please select at least one employee', 'error');
            return;
        }
        if (!selectedShiftId) {
            showToast('Please select a shift to assign', 'error');
            return;
        }
        
        try {
            setSubmitting(true);
            const res = await api.put('/shifts/bulk-assign', {
                shift_id: selectedShiftId,
                employee_ids: selectedEmployees
            });
            if (res.data.success) {
                showToast('Shifts assigned successfully');
                setSelectedEmployees([]);
                setSelectedShiftId('');
                fetchData();
            } else {
                showToast(res.data.message || 'Failed to assign shifts', 'error');
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to assign shifts', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [h, m] = timeStr.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${m} ${ampm}`;
    };

    return (
        <div className="space-y-6">
            {toast && <Toast {...toast} />}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Shift Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Configure shifts and manage employee rotations.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 gap-1">
                <button
                    onClick={() => setViewMode('configurations')}
                    className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                        viewMode === 'configurations' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <Clock size={16} /> Configurations
                </button>
                {isPrivileged && (
                    <button
                        onClick={() => setViewMode('assignments')}
                        className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                            viewMode === 'assignments' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Users size={16} /> Employee Assignments
                    </button>
                )}
            </div>

            {/* View Mode: Configurations */}
            {viewMode === 'configurations' && (
                <>
                    {isPrivileged && (
                        <div className="flex justify-end">
                            <button onClick={() => openModal()} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-sm font-semibold text-sm">
                                <Plus size={18} /> Add Shift
                            </button>
                        </div>
                    )}
                    
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1,2,3].map(i => <div key={i} className="h-48 skeleton rounded-2xl bg-slate-100" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {shifts.map((shift) => (
                                <div key={shift.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all group relative overflow-hidden">
                                    <div className={`absolute top-0 left-0 w-1 h-full ${shift.status === 'Active' ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800">{shift.name}</h3>
                                            <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded-md mt-1 inline-block">#{shift.shift_code}</span>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            shift.status === 'Active' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-500'
                                        }`}>
                                            {shift.status}
                                        </span>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500 font-medium">Timings</span>
                                            <span className="font-bold text-slate-700">{formatTime(shift.start_time)} - {formatTime(shift.end_time)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500 font-medium">Grace Time</span>
                                            <span className="font-bold text-slate-700">{shift.grace_time} mins</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500 font-medium">Weekly Off</span>
                                            <span className="font-bold text-rose-600">{shift.weekly_off}</span>
                                        </div>
                                    </div>

                                    {isPrivileged && (
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity mt-4 pt-4 border-t border-slate-100">
                                            <button onClick={() => openModal(shift)} className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold text-slate-600 bg-slate-50 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors">
                                                <Pencil size={16} /> Edit
                                            </button>
                                            <button onClick={() => handleDelete(shift.id)} className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 hover:text-rose-700 transition-colors">
                                                <Trash2 size={16} /> Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* View Mode: Assignments */}
            {viewMode === 'assignments' && isPrivileged && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[70vh]">
                    
                    {/* Floating Action Bar */}
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between sticky top-0 z-10">
                        <div className="text-sm font-bold text-slate-700">
                            {selectedEmployees.length} Employee(s) Selected
                        </div>
                        <div className="flex items-center gap-3">
                            <select 
                                className="border rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-100 outline-none w-48"
                                value={selectedShiftId}
                                onChange={(e) => setSelectedShiftId(e.target.value)}
                            >
                                <option value="">-- Select Shift --</option>
                                {shifts.map(s => <option key={s.id} value={s.id}>{s.name} ({formatTime(s.start_time)} - {formatTime(s.end_time)})</option>)}
                            </select>
                            <button 
                                onClick={handleBulkAssign}
                                disabled={submitting || selectedEmployees.length === 0 || !selectedShiftId}
                                className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {submitting ? 'Assigning...' : 'Assign Shift'}
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto">
                        {loading ? (
                            <div className="p-6 text-center text-slate-500">Loading...</div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider sticky top-0 shadow-sm">
                                    <tr>
                                        <th className="px-6 py-4 w-16">
                                            <input 
                                                type="checkbox" 
                                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                                                checked={selectedEmployees.length === employees.length && employees.length > 0}
                                                onChange={toggleAllEmployees}
                                            />
                                        </th>
                                        <th className="px-6 py-4">Employee</th>
                                        <th className="px-6 py-4">Department</th>
                                        <th className="px-6 py-4">Designation</th>
                                        <th className="px-6 py-4">Current Shift</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {employees.map(emp => (
                                        <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <input 
                                                    type="checkbox"
                                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                                                    checked={selectedEmployees.includes(emp.id)}
                                                    onChange={() => toggleEmployeeSelection(emp.id)}
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800">{emp.first_name} {emp.last_name}</div>
                                                <div className="text-xs text-slate-500">{emp.employee_code}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-700">{emp.department || '—'}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{emp.designation || '—'}</td>
                                            <td className="px-6 py-4">
                                                {emp.shift_name ? (
                                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100">
                                                        {emp.shift_name}
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-medium">
                                                        No Shift Assigned
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {employees.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-slate-500 font-medium">No employees found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* Modal for Shift Configurations */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-800">{formData.id ? 'Edit Shift' : 'Create New Shift'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-xl">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Shift Name</label>
                                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-400" placeholder="e.g. Morning Shift" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Start Time</label>
                                        <input type="time" required value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">End Time</label>
                                        <input type="time" required value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Grace Time (Mins)</label>
                                        <input type="number" min="0" required value={formData.grace_time} onChange={(e) => setFormData({...formData, grace_time: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Weekly Off</label>
                                        <select value={formData.weekly_off} onChange={(e) => setFormData({...formData, weekly_off: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all">
                                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                                                <option key={day} value={day}>{day}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Status</label>
                                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all">
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                                    <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                        {submitting ? 'Saving...' : 'Save Shift'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
