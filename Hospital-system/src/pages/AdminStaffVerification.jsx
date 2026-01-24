import React, { useState, useEffect } from 'react';
import { ShieldCheck, XCircle, User, Briefcase, IdCard, Hash, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

const AdminStaffVerification = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Backend API URL - update this to match your backend URL
  const API_BASE_URL = 'http://localhost:3000'; // Update port as needed

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/staff`);
      if (!response.ok) {
        throw new Error('Failed to fetch staff data');
      }
      const data = await response.json();
      setStaff(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAccept = async (_id) => {
    try {
      setMessage({ type: '', text: '' });
      const response = await fetch(`${API_BASE_URL}/admin/staff/${_id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept staff member');
      }
      setMessage({ type: 'success', text: data.message || 'Staff member accepted successfully!' });
      await fetchStaff();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleReject = async (_id) => {
    try {
      setMessage({ type: '', text: '' });
      const response = await fetch(`${API_BASE_URL}/admin/staff/${_id}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject staff member');
      }
      setMessage({ type: 'success', text: data.message || 'Staff member rejected successfully!' });
      await fetchStaff();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  // Only show staff with status 'accepted' or 'rejected'
  const verifiedStaff = staff.filter(s => s.status === 'accepted' || s.status === 'rejected');

  return (
    <AdminLayout title="Staff Verification">
      <div className="flex flex-col items-center w-full py-10 px-4">

        {/* Message Display */}
        {message.text && (
          <div className="w-full max-w-3xl mb-6">
            <div className={`flex items-center gap-2 p-4 rounded-xl ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}
        {/* Staff Cards */}
        <div className="w-full max-w-5xl flex flex-col gap-8">
          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-8 text-center">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading staff data...</p>
            </div>
          )}
          {/* Error State */}
          {error && (
            <div className="bg-red-50 rounded-xl shadow-lg border border-red-200 p-6">
              <p className="text-red-600 font-semibold">Error: {error}</p>
              <button
                onClick={fetchStaff}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}
          {/* Staff List */}
          {!loading && !error && verifiedStaff.length === 0 && (
            <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-8 text-center">
              <p className="text-gray-600">No verified staff members found.</p>
            </div>
          )}
          {!loading && !error && verifiedStaff.map((s) => (
            <div key={s._id} className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 flex flex-col gap-4">
              <div className="flex flex-wrap gap-6 mb-2">
                <div className="flex items-center gap-2">
                  <Hash className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-700">Staff ID:</span>
                  <span className="text-gray-800">{s._id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-700">Name:</span>
                  <span className="text-gray-800">{s.username}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-700">Position:</span>
                  <span className="text-gray-800">{s.position}</span>
                </div>
                <div className="flex items-center gap-2">
                  <IdCard className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-700">Employee No:</span>
                  <span className="text-gray-800">{s.employee_number}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className={`w-5 h-5 ${s.status === 'accepted' ? 'text-green-600' : 'text-red-600'}`} />
                  <span className="font-semibold text-gray-700">Status:</span>
                  <span className={`font-bold ${s.status === 'accepted' ? 'text-green-600' : 'text-red-600'}`}>
                    {s.status === 'accepted' ? 'Accepted' : 'Rejected'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminStaffVerification; 