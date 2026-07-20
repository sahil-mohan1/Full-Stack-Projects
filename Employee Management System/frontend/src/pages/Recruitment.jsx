import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';

export const Recruitment = () => {
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('jobs');
  const [showJobForm, setShowJobForm] = useState(false);
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  
  const { user } = useAuth();
  
  const [jobForm, setJobForm] = useState({ title: '', department_id: '', description: '', status: 'Open' });
  const [candidateForm, setCandidateForm] = useState({ job_id: '', first_name: '', last_name: '', email: '', status: 'Applied' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [jobsRes, candsRes, deptsRes] = await Promise.all([
        axios.get('http://localhost:8000/api/jobs'),
        axios.get('http://localhost:8000/api/candidates'),
        axios.get('http://localhost:8000/api/departments')
      ]);
      setJobs(jobsRes.data.data || []);
      setCandidates(candsRes.data.data || []);
      setDepartments(deptsRes.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/jobs', jobForm);
      alert('Job posted successfully');
      setShowJobForm(false);
      fetchData();
      setJobForm({ title: '', department_id: '', description: '', status: 'Open' });
    } catch (err) {
      alert('Failed to post job');
    }
  };

  const handleCandidateSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/candidates', candidateForm);
      alert('Candidate added successfully');
      setShowCandidateForm(false);
      fetchData();
      setCandidateForm({ job_id: '', first_name: '', last_name: '', email: '', status: 'Applied' });
    } catch (err) {
      alert('Failed to add candidate');
    }
  };

  const updateCandidateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:8000/api/candidates/${id}/status`, { status });
      fetchData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) return <div>Loading recruitment data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Recruitment Management</h1>
        <div className="flex gap-2">
          {activeTab === 'jobs' ? (
            <Button onClick={() => setShowJobForm(!showJobForm)}>{showJobForm ? 'Cancel' : 'Post Job'}</Button>
          ) : (
            <Button onClick={() => setShowCandidateForm(!showCandidateForm)}>{showCandidateForm ? 'Cancel' : 'Add Candidate'}</Button>
          )}
        </div>
      </div>

      <div className="flex space-x-4 border-b">
        <button className={`py-2 px-4 ${activeTab === 'jobs' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`} onClick={() => setActiveTab('jobs')}>
          Job Postings
        </button>
        <button className={`py-2 px-4 ${activeTab === 'candidates' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`} onClick={() => setActiveTab('candidates')}>
          Candidates
        </button>
      </div>

      {activeTab === 'jobs' && (
        <div className="space-y-6">
          {showJobForm && (
            <form onSubmit={handleJobSubmit} className="bg-white p-6 rounded-lg shadow-sm space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Job Title</label>
                  <input required type="text" value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <select required value={jobForm.department_id} onChange={e => setJobForm({...jobForm, department_id: e.target.value})} className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3">
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea required rows="4" value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3"></textarea>
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit">Post Job</Button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map(job => (
              <div key={job.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-500">{job.department_name}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${job.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {job.status}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-4 line-clamp-3">{job.description}</p>
                <div className="text-xs text-gray-400">Posted: {new Date(job.created_at).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'candidates' && (
        <div className="space-y-6">
          {showCandidateForm && (
            <form onSubmit={handleCandidateSubmit} className="bg-white p-6 rounded-lg shadow-sm space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input required type="text" value={candidateForm.first_name} onChange={e => setCandidateForm({...candidateForm, first_name: e.target.value})} className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input required type="text" value={candidateForm.last_name} onChange={e => setCandidateForm({...candidateForm, last_name: e.target.value})} className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input required type="email" value={candidateForm.email} onChange={e => setCandidateForm({...candidateForm, email: e.target.value})} className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Applying For (Job)</label>
                  <select required value={candidateForm.job_id} onChange={e => setCandidateForm({...candidateForm, job_id: e.target.value})} className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3">
                    <option value="">Select Job</option>
                    {jobs.filter(j => j.status === 'Open').map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit">Add Candidate</Button>
              </div>
            </form>
          )}

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Applied</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {candidates.length === 0 && (
                  <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">No candidates found.</td></tr>
                )}
                {candidates.map(c => (
                  <tr key={c.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{c.first_name} {c.last_name}</div>
                      <div className="text-sm text-gray-500">{c.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.job_title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <select 
                        value={c.status} 
                        onChange={(e) => updateCandidateStatus(c.id, e.target.value)}
                        className="border rounded px-2 py-1 text-sm font-medium"
                      >
                        <option value="Applied">Applied</option>
                        <option value="Interviewing">Interviewing</option>
                        <option value="Offered">Offered</option>
                        <option value="Hired">Hired</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button variant="secondary" onClick={() => window.location.href = `mailto:${c.email}`}>
                        Email
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
