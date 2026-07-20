import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';

export const Performance = () => {
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    employee_id: '',
    review_period: '',
    rating: 3,
    comments: '',
    status: 'Draft'
  });

  useEffect(() => {
    fetchReviews();
    fetchEmployees();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/performance');
      setReviews(res.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/employees');
      setEmployees(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/performance', {
        ...formData,
        reviewer_id: user?.employee_id || 1 // Fallback for Super Admin
      });
      alert('Review created successfully');
      setShowForm(false);
      fetchReviews();
      setFormData({ employee_id: '', review_period: '', rating: 3, comments: '', status: 'Draft' });
    } catch (err) {
      alert('Failed to create review');
    }
  };

  const canCreateReview = ['Manager', 'HR', 'Super Admin'].includes(user?.role);

  if (loading) return <div>Loading performance reviews...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Performance Management</h1>
        {canCreateReview && (
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'New Review'}
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Employee</label>
              <select required value={formData.employee_id} onChange={e => setFormData({...formData, employee_id: e.target.value})} className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3">
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Review Period</label>
              <input required type="text" placeholder="e.g., Q3 2026" value={formData.review_period} onChange={e => setFormData({...formData, review_period: e.target.value})} className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rating (1-5)</label>
              <input required type="number" min="1" max="5" value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3">
                <option value="Draft">Draft</option>
                <option value="Submitted">Submitted</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Comments</label>
              <textarea required rows="4" value={formData.comments} onChange={e => setFormData({...formData, comments: e.target.value})} className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3"></textarea>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Save Review</Button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reviewer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reviews.length === 0 && (
              <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">No performance reviews found.</td></tr>
            )}
            {reviews.map(r => (
              <tr key={r.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.emp_first} {r.emp_last}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.rev_first} {r.rev_last}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.review_period}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex text-yellow-400">
                    {Array.from({length: 5}).map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${r.status === 'Submitted' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
