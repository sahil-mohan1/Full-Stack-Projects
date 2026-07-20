import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Building2, X } from 'lucide-react';

const DEPT_COLORS = [
    'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-cyan-500',
    'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-blue-500',
];

export const Departments = () => {
    const { user } = useAuth();
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '', department_code: '', department_head_id: '', status: 'Active' });
    const [employees, setEmployees] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);

    const isAdminOrHR = ['Super Admin', 'HR', 'HR Admin'].includes(user?.role);

    const fetchDepartments = async () => {
        try {
            const [deptRes, empRes] = await Promise.all([
                api.get('/departments'),
                api.get('/employees')
            ]);
            if (deptRes.data.success) setDepartments(deptRes.data.data);
            if (empRes.data.success) setEmployees(empRes.data.data);
        } catch {
            setError('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDepartments(); }, []);

    const openAdd = () => {
        setFormData({ name: '', description: '', department_code: '', department_head_id: '', status: 'Active' });
        setEditingId(null);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingId) {
                await api.put(`/departments/${editingId}`, formData);
            } else {
                await api.post('/departments', formData);
            }
            setIsModalOpen(false);
            fetchDepartments();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save department');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (dept) => {
        setFormData({ 
            name: dept.name, 
            description: dept.description || '',
            department_code: dept.department_code || '',
            department_head_id: dept.department_head_id || '',
            status: dept.status || 'Active'
        });
        setEditingId(dept.id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this department?')) return;
        try {
            await api.delete(`/departments/${id}`);
            fetchDepartments();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete department');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                    {loading ? '...' : `${departments.length} departments`}
                </p>
                {isAdminOrHR && (
                    <button
                        onClick={openAdd}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-sm font-semibold text-sm"
                    >
                        <Plus size={18} />
                        Add Department
                    </button>
                )}
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">{error}</div>}

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1,2,3].map(i => <div key={i} className="h-32 skeleton rounded-2xl" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {departments.length === 0 ? (
                        <div className="col-span-3 bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
                            <Building2 size={40} className="mx-auto mb-3 text-slate-200" />
                            <p className="text-slate-500">No departments yet.</p>
                        </div>
                    ) : departments.map((dept, i) => {
                        const color = DEPT_COLORS[i % DEPT_COLORS.length];
                        return (
                            <div key={dept.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 group relative overflow-hidden">
                                <div className={`absolute top-0 right-0 w-20 h-20 ${color} opacity-5 rounded-full -mr-5 -mt-5`} />
                                <div className="flex items-start justify-between">
                                    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
                                        <Building2 size={18} className="text-white" />
                                    </div>
                                    {isAdminOrHR && (
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEdit(dept)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Edit2 size={15} />
                                            </button>
                                            <button onClick={() => handleDelete(dept.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-slate-800">{dept.name}</h3>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${dept.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                        {dept.status}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 font-medium mb-1">Code: {dept.department_code}</p>
                                <p className="text-sm text-slate-500 line-clamp-2">{dept.description || 'No description provided'}</p>
                                {dept.head_first_name && (
                                    <p className="text-xs text-slate-600 mt-2 font-medium">Head: {dept.head_first_name} {dept.head_last_name}</p>
                                )}
                                <div className="flex justify-between items-center mt-3">
                                    <p className="text-xs text-slate-400">Added {new Date(dept.created_at).toLocaleDateString()}</p>
                                    <span className="text-xs font-semibold text-slate-500">{dept.employee_count || 0} Employees</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
                            <h2 className="text-lg font-bold text-slate-800">{editingId ? 'Edit Department' : 'New Department'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Department Name</label>
                                <input
                                    type="text" required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Engineering"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                                />
                            </div>
                            {!editingId && (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Department Code (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.department_code}
                                        onChange={(e) => setFormData({ ...formData, department_code: e.target.value })}
                                        placeholder="Auto-generated if left blank"
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Department Head</label>
                                <select
                                    value={formData.department_head_id}
                                    onChange={(e) => setFormData({ ...formData, department_head_id: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                                >
                                    <option value="">None</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                                <textarea
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description..."
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm resize-none"
                                />
                            </div>
                            <div className="flex gap-3 pt-2 shrink-0">
                                <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 transition-colors font-semibold text-sm disabled:opacity-60">
                                    {saving ? 'Saving...' : (editingId ? 'Update' : 'Create Department')}
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
