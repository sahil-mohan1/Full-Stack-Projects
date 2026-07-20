import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { Printer, Download, ChevronLeft } from 'lucide-react';

export const Payslip = () => {
    const { id } = useParams();
    const [payslip, setPayslip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPayslip = async () => {
            try {
                const response = await api.get(`/payroll/${id}/payslip`);
                if (response.data.success) {
                    setPayslip(response.data.data);
                } else {
                    setError('Payslip not found');
                }
            } catch (err) {
                setError('Failed to load payslip');
            } finally {
                setLoading(false);
            }
        };
        fetchPayslip();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    if (error) return <div className="flex justify-center items-center h-screen text-red-500 font-bold">{error}</div>;

    const companyInfo = {
        name: "Acme Corporation",
        address: "123 Business Avenue, Tech District, Silicon Valley, CA 94025",
        email: "hr@acmecorp.com"
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans print:bg-white print:py-0 print:px-0">
            {/* Non-printable controls */}
            <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
                <button onClick={() => window.close()} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium">
                    <ChevronLeft size={18} /> Close Window
                </button>
                <button onClick={handlePrint} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 shadow-sm font-semibold transition-colors">
                    <Printer size={18} /> Print / Save as PDF
                </button>
            </div>

            {/* Printable Area */}
            <div className="max-w-4xl mx-auto bg-white p-10 rounded-2xl shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0">
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-indigo-600 pb-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">{companyInfo.name}</h1>
                        <p className="text-sm text-slate-500 mt-1 max-w-xs">{companyInfo.address}</p>
                        <p className="text-sm text-slate-500">{companyInfo.email}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-4xl font-black text-indigo-100 uppercase tracking-widest">PAYSLIP</h2>
                        <p className="text-lg font-bold text-slate-700 mt-2">
                            {new Date(0, payslip.month - 1).toLocaleString('default', { month: 'long' })} {payslip.year}
                        </p>
                    </div>
                </div>

                {/* Employee Info */}
                <div className="grid grid-cols-2 gap-8 mb-8 bg-slate-50 p-6 rounded-xl border border-slate-100 print:bg-slate-50 print:border-slate-200">
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Employee Details</h3>
                        <div className="space-y-2">
                            <p className="text-sm flex justify-between"><span className="text-slate-500 font-medium">Name:</span> <span className="font-bold text-slate-800">{payslip.first_name} {payslip.last_name}</span></p>
                            <p className="text-sm flex justify-between"><span className="text-slate-500 font-medium">Employee ID:</span> <span className="font-semibold text-slate-700">{payslip.employee_code}</span></p>
                            <p className="text-sm flex justify-between"><span className="text-slate-500 font-medium">Designation:</span> <span className="font-semibold text-slate-700">{payslip.designation || '—'}</span></p>
                            <p className="text-sm flex justify-between"><span className="text-slate-500 font-medium">Department:</span> <span className="font-semibold text-slate-700">{payslip.department || '—'}</span></p>
                            <p className="text-sm flex justify-between"><span className="text-slate-500 font-medium">Joining Date:</span> <span className="font-semibold text-slate-700">{payslip.joining_date ? new Date(payslip.joining_date).toLocaleDateString() : '—'}</span></p>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Payment Details</h3>
                        <div className="space-y-2">
                            <p className="text-sm flex justify-between"><span className="text-slate-500 font-medium">Bank Name:</span> <span className="font-semibold text-slate-700">{payslip.bank_name || '—'}</span></p>
                            <p className="text-sm flex justify-between"><span className="text-slate-500 font-medium">Account No:</span> <span className="font-mono text-slate-700">{payslip.account_number || '—'}</span></p>
                            <p className="text-sm flex justify-between"><span className="text-slate-500 font-medium">PF Number:</span> <span className="font-mono text-slate-700">{payslip.pf_number || '—'}</span></p>
                            <p className="text-sm flex justify-between"><span className="text-slate-500 font-medium">Payment Date:</span> <span className="font-semibold text-slate-700">{payslip.payment_date ? new Date(payslip.payment_date).toLocaleDateString() : '—'}</span></p>
                        </div>
                    </div>
                </div>

                {/* Salary Breakdown */}
                <div className="mb-8">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Salary Breakdown</h3>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800 text-white text-sm">
                                <th className="px-4 py-3 rounded-l-lg font-medium">Earnings</th>
                                <th className="px-4 py-3 font-medium text-right">Amount ($)</th>
                                <th className="px-4 py-3 font-medium">Deductions</th>
                                <th className="px-4 py-3 rounded-r-lg font-medium text-right">Amount ($)</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            <tr className="border-b border-slate-100">
                                <td className="px-4 py-3 text-slate-600 font-medium">Basic Salary</td>
                                <td className="px-4 py-3 font-mono text-right">{parseFloat(payslip.basic_salary).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                <td className="px-4 py-3 text-slate-600 font-medium">Tax / PF</td>
                                <td className="px-4 py-3 font-mono text-right text-rose-600">{parseFloat(payslip.deductions).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                            </tr>
                            <tr className="border-b border-slate-100">
                                <td className="px-4 py-3 text-slate-600 font-medium">Allowances</td>
                                <td className="px-4 py-3 font-mono text-right">{parseFloat(payslip.allowances).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                <td className="px-4 py-3 text-slate-600 font-medium"></td>
                                <td className="px-4 py-3 font-mono text-right"></td>
                            </tr>
                            {/* Totals */}
                            <tr className="bg-slate-50 font-bold">
                                <td className="px-4 py-4 text-slate-800">Total Earnings</td>
                                <td className="px-4 py-4 font-mono text-right text-emerald-600">{(parseFloat(payslip.basic_salary) + parseFloat(payslip.allowances)).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                <td className="px-4 py-4 text-slate-800">Total Deductions</td>
                                <td className="px-4 py-4 font-mono text-right text-rose-600">{parseFloat(payslip.deductions).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Net Salary */}
                <div className="bg-indigo-50 border-l-4 border-indigo-600 p-6 rounded-r-xl flex justify-between items-center mb-12">
                    <div>
                        <p className="text-sm font-bold text-indigo-900 uppercase tracking-wider">Net Salary Payable</p>
                        <p className="text-xs text-indigo-600/80 mt-1">Amount transferred to registered bank account</p>
                    </div>
                    <div className="text-3xl font-black text-indigo-700 font-mono">
                        ${parseFloat(payslip.net_salary).toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </div>
                </div>

                {/* Signatures */}
                <div className="flex justify-between items-end pt-12">
                    <div className="text-center">
                        <div className="w-48 border-b-2 border-slate-200 mb-2"></div>
                        <p className="text-xs font-bold text-slate-500 uppercase">Employer Signature</p>
                    </div>
                    <div className="text-center">
                        <div className="w-48 border-b-2 border-slate-200 mb-2"></div>
                        <p className="text-xs font-bold text-slate-500 uppercase">Employee Signature</p>
                    </div>
                </div>
                
                {/* Footer */}
                <div className="mt-16 text-center text-xs text-slate-400 print:mt-auto pt-8 border-t border-slate-100">
                    <p>This is a computer generated document. No signature is required.</p>
                </div>
            </div>
            
            <style jsx global>{`
                @media print {
                    body {
                        background-color: white !important;
                    }
                }
            `}</style>
        </div>
    );
};
