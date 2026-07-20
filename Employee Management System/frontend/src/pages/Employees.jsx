import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Eye, Search, Users, PowerOff, Download, Upload, Edit } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const statusClasses = {
    Active: 'bg-emerald-100 text-emerald-700',
    Inactive: 'bg-amber-100 text-amber-700',
    Terminated: 'bg-red-100 text-red-700',
};

const avatarColors = [
    'bg-indigo-500', 'bg-purple-500', 'bg-pink-500',
    'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500',
];

const getAvatarColor = (name) => {
    const idx = (name?.charCodeAt(0) || 0) % avatarColors.length;
    return avatarColors[idx];
};

export const Employees = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const isAdminOrHR = ['Super Admin', 'HR', 'HR Admin'].includes(user?.role);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await api.get('/employees');
                if (response.data.success) setEmployees(response.data.data);
            } catch {
                setError('Failed to fetch employees');
            } finally {
                setLoading(false);
            }
        };
        fetchEmployees();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to deactivate this employee?')) return;
        try {
            const res = await api.delete(`/employees/${id}`);
            if (res.data.success) {
                setEmployees(employees.map(emp => emp.id === id ? { ...emp, status: 'Inactive' } : emp));
            } else {
                alert(res.data.message || 'Failed to deactivate employee');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to deactivate employee');
        }
    };

    const handleExport = async () => {
        try {
            const response = await api.get('/employees/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'employees_export.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Failed to export employees');
        }
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/employees/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                alert(res.data.message);
                const response = await api.get('/employees');
                if (response.data.success) setEmployees(response.data.data);
            } else {
                alert(res.data.message || 'Import failed');
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Import failed');
        }
        e.target.value = null;
    };

    const filteredEmployees = employees.filter(emp =>
        `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.department || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-100 rounded-xl">
                        <Users size={20} className="text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">
                            {loading ? '...' : `${filteredEmployees.length} of ${employees.length} employees`}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, code, dept..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white w-72 shadow-sm"
                        />
                    </div>
                    {isAdminOrHR && (
                        <>
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2.5 rounded-xl hover:bg-emerald-200 transition-all font-semibold text-sm"
                            >
                                <Download size={18} />
                                Export
                            </button>
                            <label className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-200 transition-all font-semibold text-sm cursor-pointer">
                                <Upload size={18} />
                                Import
                                <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
                            </label>
                            <button
                                onClick={() => navigate('/employees/add')}
                                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-sm font-semibold text-sm hover:shadow-md"
                            >
                                <Plus size={18} />
                                Add Employee
                            </button>
                        </>
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="p-6 space-y-4">
                        {[1,2,3,4,5].map(i => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl skeleton" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-48 skeleton" />
                                    <div className="h-3 w-32 skeleton" />
                                </div>
                                <div className="h-6 w-20 skeleton rounded-full" />
                                <div className="h-6 w-16 skeleton rounded-full" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4">Code</th>
                                <th className="px-6 py-4">Department</th>
                                <th className="px-6 py-4">Designation</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center">
                                        <Users size={40} className="mx-auto mb-3 text-slate-200" />
                                        <p className="text-slate-500 text-sm">No employees found.</p>
                                        {searchTerm && (
                                            <button onClick={() => setSearchTerm('')} className="mt-2 text-indigo-600 text-sm font-medium">
                                                Clear search
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ) : filteredEmployees.map((emp) => {
                                const initials = `${emp.first_name?.[0] || ''}${emp.last_name?.[0] || ''}`;
                                const avatarColor = getAvatarColor(emp.first_name);
                                return (
                                    <tr key={emp.id} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-xl ${avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                                                    {initials}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800 text-sm">{emp.first_name} {emp.last_name}</p>
                                                    <p className="text-xs text-slate-400">{emp.personal_email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">{emp.employee_code}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{emp.department || '—'}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{emp.designation || '—'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusClasses[emp.status] || 'bg-slate-100 text-slate-600'}`}>
                                                {emp.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                to={`/employees/${emp.id}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                                            >
                                                <Eye size={14} />
                                                View
                                            </Link>
                                            {isAdminOrHR && (
                                                <Link
                                                    to={`/employees/edit/${emp.id}`}
                                                    className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                                                >
                                                    <Edit size={14} />
                                                    Edit
                                                </Link>
                                            )}
                                            {isAdminOrHR && emp.status !== 'Inactive' && (
                                                <button
                                                    onClick={() => handleDelete(emp.id)}
                                                    className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                                                    title="Deactivate Employee"
                                                >
                                                    <PowerOff size={14} />
                                                    Deactivate
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
