import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, User, Briefcase, CreditCard, DollarSign, FileText, Laptop, Upload, Trash2, Download } from 'lucide-react';

export const EmployeeProfile = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [employee, setEmployee] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');

    const fetchEmployeeData = async () => {
        try {
            const [empRes, docRes, assetRes] = await Promise.all([
                api.get(`/employees/${id}`),
                api.get(`/documents/employee/${id}`),
                api.get('/assets')
            ]);
            if (empRes.data.success) setEmployee(empRes.data.data);
            else setError(empRes.data.message);
            
            if (docRes.data.success) setDocuments(docRes.data.data);
            if (assetRes.data.success) {
                setAssets(assetRes.data.data.filter(a => a.assigned_to === parseInt(id)));
            }
        } catch (err) {
            setError('Failed to load details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployeeData();
    }, [id]);

    const handleFileUpload = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        formData.append('employee_id', id);
        try {
            const res = await api.post('/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                const docRes = await api.get(`/documents/employee/${id}`);
                setDocuments(docRes.data.data);
                e.target.reset();
            } else {
                alert(res.data.message);
            }
        } catch (err) {
            alert('Upload failed');
        }
    };

    const handleDeleteDoc = async (docId) => {
        if (!window.confirm("Delete this document?")) return;
        try {
            await api.delete(`/documents/${docId}`);
            const docRes = await api.get(`/documents/employee/${id}`);
            setDocuments(docRes.data.data);
        } catch (err) {
            alert('Delete failed');
        }
    };

    if (loading) return <div className="text-center p-8">Loading profile...</div>;
    if (error) return <div className="text-center p-8 text-red-600">{error}</div>;
    if (!employee) return <div className="text-center p-8">Employee not found.</div>;

    const Section = ({ title, icon, children }) => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center mb-6 pb-2 border-b border-slate-100">
                {icon}
                <span className="ml-2">{title}</span>
            </h2>
            <div className="grid grid-cols-2 gap-6">
                {children}
            </div>
        </div>
    );

    const Info = ({ label, value }) => (
        <div>
            <p className="text-sm text-slate-500 font-medium mb-1">{label}</p>
            <p className="text-slate-800 font-semibold">{value || '-'}</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex items-center space-x-4">
                <Link to="/employees" className="p-2 bg-white text-slate-600 hover:text-indigo-600 rounded-lg shadow-sm border border-slate-200 transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">{employee.first_name} {employee.last_name}</h1>
                    <p className="text-slate-500 mt-1">{employee.designation_name || 'No Designation'} • {employee.department_name || 'No Department'}</p>
                </div>
                <div className="ml-auto">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        employee.status === 'Active' ? 'bg-green-100 text-green-700' : 
                        employee.status === 'Inactive' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                        {employee.status}
                    </span>
                </div>
            </div>

            <div className="flex border-b border-slate-200 mb-6 space-x-4">
                <button 
                    className={`px-4 py-2 font-medium ${activeTab === 'profile' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`} 
                    onClick={() => setActiveTab('profile')}
                >
                    Profile Details
                </button>
                <button 
                    className={`px-4 py-2 font-medium ${activeTab === 'documents' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`} 
                    onClick={() => setActiveTab('documents')}
                >
                    Documents
                </button>
                <button 
                    className={`px-4 py-2 font-medium ${activeTab === 'assets' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`} 
                    onClick={() => setActiveTab('assets')}
                >
                    Assets
                </button>
            </div>

            {activeTab === 'profile' && (
                <>
                    <Section title="Personal Information" icon={<User className="text-indigo-500" size={24}/>}>
                        <Info label="Employee Code" value={employee.employee_code} />
                        <Info label="Full Name" value={`${employee.first_name} ${employee.last_name}`} />
                        <Info label="Gender" value={employee.gender} />
                        <Info label="Date of Birth" value={new Date(employee.date_of_birth).toLocaleDateString()} />
                        <Info label="Blood Group" value={employee.blood_group} />
                        <Info label="Marital Status" value={employee.marital_status} />
                        <Info label="Personal Email" value={employee.personal_email} />
                        <Info label="Mobile Number" value={employee.mobile_number} />
                        <Info label="Emergency Contact" value={employee.emergency_contact} />
                        <div className="col-span-2">
                            <Info label="Full Address" value={employee.address} />
                        </div>
                    </Section>

                    <Section title="Official Details" icon={<Briefcase className="text-indigo-500" size={24}/>}>
                        <Info label="Department" value={employee.department_name} />
                        <Info label="Designation" value={employee.designation_name} />
                        <Info label="Employment Type" value={employee.employment_type} />
                        <Info label="Joining Date" value={new Date(employee.joining_date).toLocaleDateString()} />
                        <Info label="Probation Period" value={employee.probation_period ? `${employee.probation_period} Days` : 'N/A'} />
                    </Section>

                    <Section title="Bank Details" icon={<CreditCard className="text-indigo-500" size={24}/>}>
                        <Info label="Bank Name" value={employee.bank_name} />
                        <Info label="Account Number" value={employee.account_number} />
                        <Info label="IFSC Code" value={employee.ifsc_code} />
                        <Info label="Branch Name" value={employee.branch_name} />
                        <Info label="Account Holder" value={employee.account_holder} />
                    </Section>

                    <Section title="Salary Details" icon={<DollarSign className="text-indigo-500" size={24}/>}>
                        <Info label="Basic Salary (Annual)" value={`₹${employee.basic_salary}`} />
                        <Info label="HRA" value={`₹${employee.hra}`} />
                        <Info label="Allowances" value={`₹${employee.allowances}`} />
                        <Info label="Bonus" value={`₹${employee.bonus}`} />
                        <Info label="PF Number" value={employee.pf_number} />
                        <Info label="ESI Number" value={employee.esi_number} />
                        <Info label="Professional Tax" value={`₹${employee.professional_tax}`} />
                    </Section>
                </>
            )}

            {activeTab === 'documents' && (
                <div className="space-y-6">
                    {user?.id === employee?.user_id && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                                <Upload className="mr-2 text-indigo-500" size={20} /> Upload New Document
                            </h2>
                            <form onSubmit={handleFileUpload} className="flex space-x-4 items-end">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Document Type</label>
                                    <select name="document_type" required className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:border-indigo-500">
                                        <option value="">Select Type</option>
                                        <option value="Aadhaar Card">Aadhaar Card</option>
                                        <option value="PAN Card">PAN Card</option>
                                        <option value="Resume">Resume</option>
                                        <option value="Offer Letter">Offer Letter</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">File (PDF, JPG, PNG - Max 10MB)</label>
                                    <input type="file" name="file" accept=".pdf,.jpg,.jpeg,.png" required className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm" />
                                </div>
                                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700">
                                    Upload
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-left">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-sm">Document Type</th>
                                    <th className="px-6 py-4 font-semibold text-sm">Upload Date</th>
                                    <th className="px-6 py-4 font-semibold text-sm text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {documents.map(doc => (
                                    <tr key={doc.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-slate-800 flex items-center">
                                            <FileText size={16} className="text-slate-400 mr-2" /> {doc.document_type}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {new Date(doc.uploaded_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <a href={`http://localhost:8000/${doc.file_path}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 inline-flex items-center p-2">
                                                <Download size={18} />
                                            </a>
                                            {user?.id === employee?.user_id && (
                                                <button onClick={() => handleDeleteDoc(doc.id)} className="text-red-500 hover:text-red-700 ml-2 p-2">
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {documents.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-8 text-center text-slate-500">No documents uploaded yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'assets' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center">
                            <Laptop className="mr-2 text-indigo-500" size={20} /> Assigned Assets
                        </h2>
                    </div>
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-left">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-sm">Asset Name</th>
                                <th className="px-6 py-4 font-semibold text-sm">Status</th>
                                <th className="px-6 py-4 font-semibold text-sm">Assigned Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {assets.map(asset => (
                                <tr key={asset.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-800">{asset.name}</div>
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
                                    <td className="px-6 py-4 text-slate-600">
                                        {asset.assigned_date}
                                    </td>
                                </tr>
                            ))}
                            {assets.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="px-6 py-8 text-center text-slate-500">No assets currently assigned.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
