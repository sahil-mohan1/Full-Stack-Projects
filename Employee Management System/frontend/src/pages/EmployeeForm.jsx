import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Save } from 'lucide-react';

export const EmployeeForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [managers, setManagers] = useState([]);
    const [shifts, setShifts] = useState([]);

    const maxDob = new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        // Step 1: Personal
        first_name: '', last_name: '', gender: 'Male', date_of_birth: '',
        nationality: '', blood_group: '', marital_status: 'Single', personal_email: '',
        mobile_number: '', alternate_mobile: '', emergency_contact: '', address: '',
        // Step 2: Official
        employee_code: '', department_id: '', designation_id: '', manager_id: '', shift_id: '',
        branch: '', location: '', employment_type: 'Full-Time', joining_date: '', probation_period: '', status: 'Active',
        // Step 3: Bank
        bank_name: '', account_number: '', ifsc_code: '', branch_name: '', account_holder: '',
        // Step 4: Salary
        basic_salary: '', hra: '0', allowances: '0', bonus: '0',
        pf_number: '', esi_number: '', professional_tax: '0'
    });

    useEffect(() => {
        const fetchDependencies = async () => {
            try {
                const [deptRes, desigRes, empRes, shiftRes] = await Promise.all([
                    api.get('/departments'),
                    api.get('/designations'),
                    api.get('/employees'),
                    api.get('/shifts')
                ]);
                if (deptRes.data.success) setDepartments(deptRes.data.data);
                if (desigRes.data.success) setDesignations(desigRes.data.data);
                if (empRes.data.success) setManagers(empRes.data.data);
                if (shiftRes.data.success) setShifts(shiftRes.data.data);

                if (id) {
                    const empRes = await api.get(`/employees/${id}`);
                    if (empRes.data.success) {
                        setFormData(prev => ({ ...prev, ...empRes.data.data }));
                    }
                }
            } catch (error) {
                console.error("Failed to load dependencies");
            }
        };
        fetchDependencies();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = id 
                ? await api.put(`/employees/${id}`, formData)
                : await api.post('/employees', formData);
            if (res.data.success) {
                navigate('/employees');
            } else {
                alert(res.data.message);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create employee');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">{id ? 'Edit Employee' : 'Add New Employee'}</h1>
                <p className="text-slate-500 mt-1">{id ? 'Update employee details' : 'Complete the wizard to onboard a new staff member'}</p>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-between mb-8">
                {['Personal Info', 'Official Details', 'Bank Details', 'Salary Details'].map((title, i) => (
                    <div key={i} className="flex flex-col items-center flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-colors ${
                            step > i + 1 ? 'bg-indigo-600 text-white' : 
                            step === i + 1 ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : 'bg-slate-200 text-slate-500'
                        }`}>
                            {i + 1}
                        </div>
                        <span className={`text-xs font-medium ${step >= i + 1 ? 'text-indigo-600' : 'text-slate-400'}`}>{title}</span>
                    </div>
                ))}
            </div>

            <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }} className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                
                {step === 1 && (
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2 text-lg font-semibold text-slate-800 border-b pb-2 mb-4">Personal Information</div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
                            <input type="text" name="first_name" required value={formData.first_name} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
                            <input type="text" name="last_name" required value={formData.last_name} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Personal Email *</label>
                            <input type="email" name="personal_email" required value={formData.personal_email} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number *</label>
                            <input type="text" name="mobile_number" required value={formData.mobile_number} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Alternate Mobile</label>
                            <input type="text" name="alternate_mobile" value={formData.alternate_mobile} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth *</label>
                            <input type="date" name="date_of_birth" required max={maxDob} value={formData.date_of_birth} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Gender *</label>
                            <select name="gender" required value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500">
                                <option>Male</option><option>Female</option><option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Blood Group</label>
                            <input type="text" name="blood_group" value={formData.blood_group} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nationality</label>
                            <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Marital Status</label>
                            <select name="marital_status" value={formData.marital_status} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500">
                                <option>Single</option><option>Married</option><option>Divorced</option><option>Widowed</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Contact *</label>
                            <input type="text" name="emergency_contact" required value={formData.emergency_contact} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Address *</label>
                            <textarea name="address" required rows="3" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"></textarea>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2 text-lg font-semibold text-slate-800 border-b pb-2 mb-4">Official Details</div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Employee Code *</label>
                            <input type="text" name="employee_code" required value={formData.employee_code} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Joining Date *</label>
                            <input type="date" name="joining_date" required value={formData.joining_date} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                            <select name="department_id" value={formData.department_id} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500">
                                <option value="">Select Department</option>
                                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Designation</label>
                            <select name="designation_id" value={formData.designation_id} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500">
                                <option value="">Select Designation</option>
                                {designations.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Manager</label>
                            <select name="manager_id" value={formData.manager_id} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500">
                                <option value="">Select Manager</option>
                                {managers.filter(m => m.id.toString() !== id).map(m => <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Shift</label>
                            <select name="shift_id" value={formData.shift_id} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500">
                                <option value="">Select Shift</option>
                                {shifts.map(s => <option key={s.id} value={s.id}>{s.name} ({s.start_time.slice(0,5)} - {s.end_time.slice(0,5)})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Branch</label>
                            <input type="text" name="branch" value={formData.branch} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                            <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Employment Type *</label>
                            <select name="employment_type" required value={formData.employment_type} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500">
                                <option>Full-Time</option><option>Part-Time</option><option>Contract</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Probation Period (Days)</label>
                            <input type="number" name="probation_period" value={formData.probation_period} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                            <select name="status" required value={formData.status} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500">
                                <option>Active</option><option>Inactive</option>
                            </select>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2 text-lg font-semibold text-slate-800 border-b pb-2 mb-4">Bank Details (Optional)</div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Bank Name</label>
                            <input type="text" name="bank_name" value={formData.bank_name} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Account Number</label>
                            <input type="text" name="account_number" value={formData.account_number} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">IFSC Code</label>
                            <input type="text" name="ifsc_code" value={formData.ifsc_code} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Branch Name</label>
                            <input type="text" name="branch_name" value={formData.branch_name} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Account Holder Name</label>
                            <input type="text" name="account_holder" value={formData.account_holder} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2 text-lg font-semibold text-slate-800 border-b pb-2 mb-4">Salary Details (Optional)</div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Basic Salary (Annual)</label>
                            <input type="number" step="0.01" name="basic_salary" value={formData.basic_salary} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">HRA</label>
                            <input type="number" step="0.01" name="hra" value={formData.hra} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Allowances</label>
                            <input type="number" step="0.01" name="allowances" value={formData.allowances} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Bonus</label>
                            <input type="number" step="0.01" name="bonus" value={formData.bonus} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">PF Number</label>
                            <input type="text" name="pf_number" value={formData.pf_number} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">ESI Number</label>
                            <input type="text" name="esi_number" value={formData.esi_number} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Professional Tax</label>
                            <input type="number" step="0.01" name="professional_tax" value={formData.professional_tax} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                        </div>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-center">
                    {step > 1 ? (
                        <button type="button" onClick={prevStep} className="flex items-center space-x-2 px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                            <ChevronLeft size={20} />
                            <span>Previous</span>
                        </button>
                    ) : <div></div>}

                    {step < 4 ? (
                        <button type="submit" className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                            <span>Next</span>
                            <ChevronRight size={20} />
                        </button>
                    ) : (
                        <button type="submit" disabled={loading} className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
                            <Save size={20} />
                            <span>{loading ? 'Saving...' : 'Save Employee'}</span>
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};
