import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Employees = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const isAdminOrHR = user?.role === 'Super Admin' || user?.role === 'HR';

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/employees');
            if (response.data.success) {
                setEmployees(response.data.data);
            }
        } catch (err) {
            setError('Failed to fetch employees');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const filteredEmployees = employees.filter(emp => 
        (emp.first_name + ' ' + emp.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="text-center p-8">Loading employees...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Employees</h1>
                    <p className="text-slate-500 mt-1">Manage company staff</p>
                </div>
                {isAdminOrHR && (
                    <button 
                        onClick={() => navigate('/employees/add')}
                        className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Plus size={20} />
                        <span>Add Employee</span>
                    </button>
                )}
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>}

            <div className="mb-6">
                <input 
                    type="text" 
                    placeholder="Search by name or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-md px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                            <th className="p-4">Code</th>
                            <th className="p-4">Name</th>
                            <th className="p-4">Department</th>
                            <th className="p-4">Designation</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.map((emp) => (
                            <tr key={emp.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                <td className="p-4 text-slate-600 font-medium">{emp.employee_code}</td>
                                <td className="p-4 font-semibold text-slate-800">
                                    {emp.first_name} {emp.last_name}
                                    <div className="text-xs text-slate-500 font-normal">{emp.personal_email}</div>
                                </td>
                                <td className="p-4 text-slate-600">{emp.department || '-'}</td>
                                <td className="p-4 text-slate-600">{emp.designation || '-'}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        emp.status === 'Active' ? 'bg-green-100 text-green-700' : 
                                        emp.status === 'Inactive' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                        {emp.status}
                                    </span>
                                </td>
                                <td className="p-4 flex justify-end space-x-2">
                                    <Link to={`/employees/${emp.id}`} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Profile">
                                        <Eye size={18} />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {filteredEmployees.length === 0 && (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-slate-500">No employees found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
