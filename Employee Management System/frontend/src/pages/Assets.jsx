import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Laptop, Plus, Edit, Trash2 } from 'lucide-react';

export const Assets = () => {
    const { user } = useAuth();
    const [assets, setAssets] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ id: null, name: '', description: '', assigned_to: '', assigned_date: '', return_date: '', status: 'Available' });

    const fetchData = async () => {
        try {
            const [assetsRes, empRes] = await Promise.all([
                api.get('/assets'),
                api.get('/employees')
            ]);
            if (assetsRes.data.success) setAssets(assetsRes.data.data);
            if (empRes.data.success) setEmployees(empRes.data.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
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
            if (formData.id) {
                await api.put(`/assets/${formData.id}`, formData);
            } else {
                await api.post('/assets', formData);
            }
            setShowForm(false);
            fetchData();
        } catch (error) {
            console.error('Failed to save asset', error);
            alert('Failed to save asset');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this asset?')) return;
        try {
            await api.delete(`/assets/${id}`);
            fetchData();
        } catch (error) {
            console.error('Failed to delete', error);
        }
    };

    if (loading) return <div className="text-center p-8">Loading assets...</div>;

    const isAdmin = ['Super Admin', 'HR', 'Manager'].includes(user?.role);

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center">
                    <Laptop className="mr-2 text-indigo-600" />
                    Asset Management
                </h1>
                {isAdmin && (
                    <button 
                        onClick={() => {
                            setFormData({ id: null, name: '', description: '', assigned_to: '', assigned_date: new Date().toISOString().split('T')[0], return_date: '', status: 'Available' });
                            setShowForm(!showForm);
                        }}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        {showForm ? 'Cancel' : <><Plus size={18} className="mr-2" /> Add Asset</>}
                    </button>
                )}
            </div>

            {showForm && isAdmin && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
                    <h2 className="text-lg font-bold mb-4">{formData.id ? 'Edit' : 'Add'} Asset</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Asset Name</label>
                            <input 
                                type="text" required 
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                            <select 
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                value={formData.status} onChange={(e) => {
                                    const newStatus = e.target.value;
                                    setFormData(prev => ({
                                        ...prev, 
                                        status: newStatus,
                                        assigned_to: (newStatus === 'Available' || newStatus === 'Under Maintenance' || newStatus === 'Lost') ? '' : prev.assigned_to
                                    }));
                                }}
                            >
                                <option value="Available">Available</option>
                                <option value="Assigned">Assigned</option>
                                <option value="Under Maintenance">Under Maintenance</option>
                                <option value="Lost">Lost</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Assigned To</label>
                            <select 
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                value={formData.assigned_to} onChange={(e) => {
                                    const emp = e.target.value;
                                    setFormData(prev => ({
                                        ...prev, 
                                        assigned_to: emp,
                                        status: emp ? 'Assigned' : (prev.status === 'Assigned' ? 'Available' : prev.status)
                                    }));
                                }}
                            >
                                <option value="">-- None --</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_code})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Date</label>
                            <input 
                                type="date" 
                                required={formData.status === 'Assigned'}
                                disabled={formData.status !== 'Assigned'}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400"
                                value={formData.assigned_date || ''} onChange={(e) => setFormData({...formData, assigned_date: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Return Date</label>
                            <input 
                                type="date" 
                                disabled={formData.status !== 'Assigned'}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400"
                                value={formData.return_date || ''} onChange={(e) => setFormData({...formData, return_date: e.target.value})}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description / Notes</label>
                            <textarea 
                                rows="2"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                        </div>
                        <div className="col-span-2 flex justify-end">
                            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                Save Asset
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-left">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-sm">Asset Name</th>
                            <th className="px-6 py-4 font-semibold text-sm">Status</th>
                            <th className="px-6 py-4 font-semibold text-sm">Assigned To</th>
                            <th className="px-6 py-4 font-semibold text-sm">Dates</th>
                            {isAdmin && <th className="px-6 py-4 font-semibold text-sm text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {assets.map((asset) => (
                            <tr key={asset.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4">
                                    <div className="font-semibold text-slate-800">{asset.name}</div>
                                    <div className="text-xs text-slate-500">{asset.description}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        asset.status === 'Available' ? 'bg-green-100 text-green-700' :
                                        asset.status === 'Assigned' ? 'bg-blue-100 text-blue-700' :
                                        asset.status === 'Under Maintenance' ? 'bg-slate-100 text-slate-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                        {asset.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {asset.assigned_to ? `${asset.first_name} ${asset.last_name}` : <span className="text-slate-400">-</span>}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                    {asset.assigned_date ? (
                                        <>
                                            <div>Assigned: {asset.assigned_date}</div>
                                            {asset.return_date && (
                                                <div>
                                                    {new Date(asset.return_date) > new Date() ? 'Expected Return: ' : 'Returned: '}
                                                    {asset.return_date}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-slate-400">-</span>
                                    )}
                                </td>
                                {isAdmin && (
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => {
                                                setFormData({
                                                    id: asset.id, name: asset.name, description: asset.description,
                                                    assigned_to: asset.assigned_to || '', assigned_date: asset.assigned_date,
                                                    return_date: asset.return_date || '', status: asset.status
                                                });
                                                setShowForm(true);
                                            }}
                                            className="text-indigo-600 hover:text-indigo-800 p-2"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(asset.id)}
                                            className="text-red-500 hover:text-red-700 p-2 ml-2"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {assets.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                    No assets found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
