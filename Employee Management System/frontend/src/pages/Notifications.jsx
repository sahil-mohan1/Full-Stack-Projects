import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Bell, Check, Trash2 } from 'lucide-react';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      // In a real app, pass user.id to filter. 
      const res = await axios.get(`http://localhost:8000/api/notifications?user_id=${user.id}`);
      setNotifications(res.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:8000/api/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      await axios.put(`http://localhost:8000/api/notifications/read-all`, { user_id: user.id });
      setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading notifications...</div>;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Bell className="text-indigo-600" /> Notifications 
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{unreadCount}</span>
          )}
        </h1>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="secondary">Mark All as Read</Button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">You have no notifications.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {notifications.map(n => (
              <li key={n.id} className={`p-4 hover:bg-gray-50 transition-colors ${!n.is_read ? 'bg-indigo-50/30' : ''}`}>
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className={`mt-1 w-2 h-2 rounded-full ${!n.is_read ? 'bg-indigo-500' : 'bg-transparent'}`}></div>
                    <div>
                      <p className={`text-sm ${!n.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                        {n.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(n.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {!n.is_read && (
                    <button 
                      onClick={() => markAsRead(n.id)} 
                      className="text-xs text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                    >
                      <Check size={14} /> Mark Read
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
