import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle } from 'lucide-react';
import StaffLayout from '../components/StaffLayout';
import { apiGet, apiPut } from '../utils/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const data = await apiGet('/notifications');
        setNotifications(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await apiPut(`/notifications/${id}/read`, {});
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  return (
    <StaffLayout title="Notifications">
      <div className="flex flex-col items-center w-full py-10">
        {/* Notifications List */}
        <div className="w-full max-w-5xl flex flex-col gap-4">
          {loading && (
            <div className="text-center text-gray-500">Loading notifications...</div>
          )}
          {error && (
            <div className="text-center text-red-600">Error: {error}</div>
          )}
          {!loading && !error && notifications.length === 0 && (
            <div className="text-center text-gray-500">No notifications.</div>
          )}
          {!loading && !error && notifications.map((n) => (
            <div
              key={n._id}
              className={`flex items-center justify-between p-4 rounded-lg border shadow-sm transition-all ${n.read ? 'bg-gray-100 border-gray-200' : 'bg-blue-50 border-blue-200'}`}
            >
              <div className="flex items-center gap-3">
                <Bell className={`w-6 h-6 ${n.read ? 'text-gray-400' : 'text-blue-600 animate-bounce'}`} />
                <div>
                  <div className={`font-medium ${n.read ? 'text-gray-600' : 'text-blue-800'}`}>{n.message}</div>
                  <div className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</div>
                </div>
              </div>
              {!n.read && (
                <button
                  onClick={() => markAsRead(n._id)}
                  className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
                >
                  <CheckCircle className="w-4 h-4" /> Mark as read
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </StaffLayout>
  );
};

export default Notifications; 