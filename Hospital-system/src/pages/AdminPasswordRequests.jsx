import React, { useEffect, useState } from 'react';
import { ShieldCheck, RefreshCw, AlertCircle, CheckCircle, Hash, IdCard, KeyRound } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

const API_BASE_URL = 'http://localhost:3000';

const AdminPasswordRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [tempPasswordModal, setTempPasswordModal] = useState({ show: false, username: '', password: '' });

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/forgot-password`);
            if (!response.ok) {
                throw new Error('Failed to fetch password requests');
            }
            const data = await response.json();
            // Only show requests with status 'pending'
            setRequests(data.filter(r => r.status === 'pending'));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAccept = async (username) => {
        try {
            setMessage({ type: '', text: '' });
            const response = await fetch(`${API_BASE_URL}/forgot-password/accept`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to accept request');
            }
            
            // Show temporary password modal
            setTempPasswordModal({
                show: true,
                username: username,
                password: data.tempPassword
            });
            
            setMessage({ type: 'success', text: data.message || 'Request accepted successfully!' });
            await fetchRequests();
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    const handleReject = async (username, reason = '') => {
        try {
            setMessage({ type: '', text: '' });
            const response = await fetch(`${API_BASE_URL}/forgot-password/reject`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, reason })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to reject request');
            }
            setMessage({ type: 'success', text: data.message || 'Request rejected successfully!' });
            await fetchRequests();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    return (
        <AdminLayout title="Forgot Password Requests">
            {/* Temporary Password Modal */}
            {tempPasswordModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
                                <CheckCircle className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Password Reset Complete</h3>
                            <p className="text-gray-600">New temporary password generated for user</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-700">Username:</span>
                                <span className="font-mono text-gray-800">{tempPasswordModal.username}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-700">Temporary Password:</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-lg font-bold">
                                        {tempPasswordModal.password}
                                    </span>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(tempPasswordModal.password)}
                                        className="p-1 text-gray-500 hover:text-gray-700"
                                        title="Copy to clipboard"
                                    >
                                        📋
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <h4 className="font-medium text-blue-800 mb-2">📋 Instructions:</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Share this temporary password with the user</li>
                                <li>• User must login and change password immediately</li>
                                <li>• This password is valid until changed</li>
                                <li>• Keep this information secure</li>
                            </ul>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => navigator.clipboard.writeText(
                                    `Username: ${tempPasswordModal.username}\nTemporary Password: ${tempPasswordModal.password}\n\nPlease login and change your password immediately.`
                                )}
                                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                📋 Copy Details
                            </button>
                            <button
                                onClick={() => setTempPasswordModal({ show: false, username: '', password: '' })}
                                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
                {/* Requests Table/Card */}
                <div className="w-full max-w-5xl flex flex-col gap-8">
                    {loading && (
                        <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-8 text-center">
                            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                            <p className="text-gray-600">Loading password requests...</p>
                        </div>
                    )}
                    {error && (
                        <div className="bg-red-50 rounded-xl shadow-lg border border-red-200 p-6">
                            <p className="text-red-600 font-semibold">Error: {error}</p>
                            <button
                                onClick={fetchRequests}
                                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    )}
                    {!loading && !error && requests.length === 0 && (
                        <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-8 text-center">
                            <p className="text-gray-600">No password requests found.</p>
                        </div>
                    )}
                    {!loading && !error && requests.map((req, idx) => (
                        <div key={idx} className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 flex flex-col gap-4">
                            <div className="flex flex-wrap gap-6 mb-2">
                                <div className="flex items-center gap-2">
                                    <Hash className="w-5 h-5 text-blue-600" />
                                    <span className="font-semibold text-gray-700">Username:</span>
                                    <span className="text-gray-800">{req.username}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IdCard className="w-5 h-5 text-blue-600" />
                                    <span className="font-semibold text-gray-700">Employee No:</span>
                                    <span className="text-gray-800">{req.employeeNumber}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className={`w-5 h-5 ${req.status === 'accepted' ? 'text-green-600' : req.status === 'pending' ? 'text-yellow-500' : 'text-red-600'}`} />
                                    <span className="font-semibold text-gray-700">Status:</span>
                                    <span className={`font-bold ${req.status === 'accepted' ? 'text-green-600' : req.status === 'pending' ? 'text-yellow-500' : 'text-red-600'}`}>
                                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-700">Requested At:</span>
                                    <span className="text-gray-800">{new Date(req.requestedAt).toLocaleString()}</span>
                                </div>
                            </div>
                            {req.status === 'pending' && (
                                <div className="flex gap-2 mt-2">
                                    <button 
                                        onClick={() => handleAccept(req.username)} 
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Accept
                                    </button>
                                    <button 
                                        onClick={() => handleReject(req.username)} 
                                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                                    >
                                        <AlertCircle className="w-4 h-4" />
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminPasswordRequests;
