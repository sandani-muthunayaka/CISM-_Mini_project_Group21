import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, XCircle, User, Briefcase, IdCard, Hash, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';


const PendingStaffRequests = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:3000';

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

  // Only show staff with status 'pending'
  const pendingStaff = staff.filter(s => s.status === 'pending');

  // Approve/Reject handlers
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });
  const [lastAction, setLastAction] = useState('');
  const handleApprove = async (_id) => {
    try {
      setActionMessage({ type: '', text: '' });
      const response = await fetch(`${API_BASE_URL}/admin/staff/${_id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to approve staff member');
      setActionMessage({ type: 'success', text: 'Approved' });
      setLastAction('approved');
      setTimeout(() => {
        setActionMessage({ type: '', text: '' });
        setLastAction('');
        navigate(0); // Refresh the page
      }, 1000);
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
      setLastAction('');
      setTimeout(() => setActionMessage({ type: '', text: '' }), 3000);
    }
  };
  const handleReject = async (_id) => {
    try {
      setActionMessage({ type: '', text: '' });
      const response = await fetch(`${API_BASE_URL}/admin/staff/${_id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to reject staff member');
      setActionMessage({ type: 'success', text: 'Rejected' });
      setLastAction('rejected');
      setTimeout(() => {
        setActionMessage({ type: '', text: '' });
        setLastAction('');
        navigate(0); // Refresh the page
      }, 1000);
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
      setLastAction('');
      setTimeout(() => setActionMessage({ type: '', text: '' }), 3000);
    }
  };

  return (
    <AdminLayout title="Pending Staff Registration Requests">
      <div className="flex flex-col items-center w-full py-10 px-4">
        {/* Action Message Display */}
        {actionMessage.text && (
          <div className="w-full max-w-3xl mb-6">
            <div className={`flex items-center gap-2 p-4 rounded-xl ${
              actionMessage.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {actionMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{actionMessage.text}</span>
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
          {!loading && !error && pendingStaff.length === 0 && (
            <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-8 text-center">
              <p className="text-gray-600">No pending staff registration requests found.</p>
            </div>
          )}
          {!loading && !error && pendingStaff.map((s) => (
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
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-700">Status:</span>
                  <span className="font-bold text-blue-600">Pending</span>
                </div>
              </div>
              <div className="flex gap-4 mt-2">
                <button
                  onClick={() => handleApprove(s._id)}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4" /> Approve
                </button>
                <button
                  onClick={() => handleReject(s._id)}
                  className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default PendingStaffRequests;
