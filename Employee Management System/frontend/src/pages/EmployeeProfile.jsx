import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, User, Briefcase, CreditCard, DollarSign } from 'lucide-react';

export const EmployeeProfile = () => {
    const { id } = useParams();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const response = await api.get(`/employees/${id}`);
                if (response.data.success) {
                    setEmployee(response.data.data);
                } else {
                    setError(response.data.message);
                }
            } catch (err) {
                setError('Failed to load employee details');
            } finally {
                setLoading(false);
            }
        };
        fetchEmployee();
    }, [id]);

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

        </div>
    );
};
