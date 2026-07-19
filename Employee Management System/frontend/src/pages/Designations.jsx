import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export const Designations = () => {
    const { user } = useAuth();
    const [designations, setDesignations] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ title: '', department_id: '' });
    const [editingId, setEditingId] = useState(null);

    const isAdminOrHR = user?.role === 'Super Admin' || user?.role === 'HR';

    const fetchData = async () => {
        try {
            const [desigRes, deptRes] = await Promise.all([
                api.get('/designations'),
                api.get('/departments')
            ]);
            
            if (desigRes.data.success) setDesignations(desigRes.data.data);
            if (deptRes.data.success) setDepartments(deptRes.data.data);
            
        } catch (err) {
            setError('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/designations/${editingId}`, formData);
            } else {
                await api.post('/designations', formData);
            }
            setIsModalOpen(false);
            setFormData({ title: '', department_id: '' });
            setEditingId(null);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save designation');
        }
    };

    const handleEdit = (desig) => {
        setFormData({ title: desig.title, department_id: desig.department_id });
        setEditingId(desig.id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this designation?')) {
            try {
                await api.delete(`/designations/${id}`);
                fetchData();
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete designation');
            }
        }
    };

    if (loading) return <div className="text-center p-8">Loading designations...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Designations</h1>
                    <p className="text-slate-500 mt-1">Manage job titles and roles</p>
                </div>
                {isAdminOrHR && (
                    <button 
                        onClick={() => { setFormData({title: '', department_id: ''}); setEditingId(null); setIsModalOpen(true); }}
                        className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Plus size={20} />
                        <span>Add Designation</span>
                    </button>
                )}
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                            <th className="p-4">Title</th>
                            <th className="p-4">Department</th>
                            <th className="p-4">Created At</th>
                            {isAdminOrHR && <th className="p-4 text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {designations.map((desig) => (
                            <tr key={desig.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-medium text-slate-800">{desig.title}</td>
                                <td className="p-4 text-slate-600">
                                    <span className="bg-slate-100 px-2 py-1 rounded text-sm">{desig.department_name}</span>
                                </td>
                                <td className="p-4 text-slate-500">{new Date(desig.created_at).toLocaleDateString()}</td>
                                {isAdminOrHR && (
                                    <td className="p-4 flex justify-end space-x-2">
                                        <button onClick={() => handleEdit(desig)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={18} /></button>
                                        <button onClick={() => handleDelete(desig.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {designations.length === 0 && (
                            <tr>
                                <td colSpan="4" className="p-8 text-center text-slate-500">No designations found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-800">{editingId ? 'Edit Designation' : 'Add Designation'}</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                                <select 
                                    required
                                    value={formData.department_id}
                                    onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                                >
                                    <option value="" disabled>Select Department</option>
                                    {departments.map(dept => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="pt-4 flex justify-end space-x-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
