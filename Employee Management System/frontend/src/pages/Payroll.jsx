import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../components/Button';

export const Payroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generateForm, setGenerateForm] = useState({ month: new Date().toLocaleString('default', { month: 'long' }), year: new Date().getFullYear() });

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/payroll');
      setPayrolls(res.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      await axios.post('http://localhost:8000/api/payroll/generate', generateForm);
      alert('Payroll generated successfully');
      fetchPayrolls();
    } catch (err) {
      alert('Failed to generate payroll');
    } finally {
      setGenerating(false);
    }
  };

  const markPaid = async (id) => {
    if (!window.confirm("Are you sure you want to mark this as paid?")) return;
    try {
      await axios.put(`http://localhost:8000/api/payroll/${id}/pay`);
      fetchPayrolls();
    } catch (err) {
      alert('Failed to mark as paid');
    }
  };

  if (loading) return <div>Loading payrolls...</div>;

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Payroll Management</h1>
        <form onSubmit={handleGenerate} className="flex gap-2 items-center bg-white p-2 rounded shadow-sm">
          <select 
            value={generateForm.month} 
            onChange={e => setGenerateForm({...generateForm, month: e.target.value})}
            className="border rounded px-2 py-1"
          >
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <input 
            type="number" 
            value={generateForm.year} 
            onChange={e => setGenerateForm({...generateForm, year: parseInt(e.target.value)})}
            className="border rounded px-2 py-1 w-24"
          />
          <Button type="submit" disabled={generating}>
            {generating ? 'Generating...' : 'Generate Payroll'}
          </Button>
        </form>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Salary</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payrolls.length === 0 && (
              <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">No payroll records found.</td></tr>
            )}
            {payrolls.map(p => (
              <tr key={p.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{p.first_name} {p.last_name}</div>
                  <div className="text-sm text-gray-500">{p.employee_code}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {p.month} {p.year}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ${parseFloat(p.net_salary).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {p.status === 'Pending' && (
                    <Button variant="secondary" onClick={() => markPaid(p.id)}>
                      Mark Paid
                    </Button>
                  )}
                  {p.status === 'Paid' && (
                    <span className="text-gray-500 text-xs">Paid on {p.payment_date}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
