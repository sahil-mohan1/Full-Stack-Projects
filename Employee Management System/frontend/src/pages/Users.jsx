import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';

export const Users = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/users');
      setUsers(res.data.data || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch users');
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/roles');
      setRoles(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (id, roleId, isActive) => {
    try {
      await axios.put(`http://localhost:8000/api/users/${id}`, {
        role_id: roleId,
        is_active: isActive
      });
      fetchUsers();
    } catch (err) {
      alert('Failed to update user');
    }
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(u => (
              <tr key={u.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <select 
                    value={u.role_id || ''} 
                    onChange={(e) => handleUpdate(u.id, e.target.value, u.is_active)}
                    className="border rounded px-2 py-1"
                    disabled={user?.id === u.id}
                  >
                    <option value="">Select Role</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {user?.id !== u.id && (
                    <Button 
                      variant="secondary" 
                      onClick={() => handleUpdate(u.id, u.role_id, u.is_active ? 0 : 1)}
                    >
                      Toggle Status
                    </Button>
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
