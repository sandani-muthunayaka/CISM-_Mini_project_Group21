import React, { useEffect, useState } from 'react';
import { ShieldCheck, RefreshCw, AlertCircle, CheckCircle, Hash, IdCard, KeyRound } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

const API_BASE_URL = 'http://localhost:3000';

const AcceptedRejectedPasswordRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/forgot-password`);
            if (!response.ok) {
                throw new Error('Failed to fetch password requests');
            }
            const data = await response.json();
            // Only show requests with status 'accepted' or 'rejected'
            setRequests(data.filter(r => r.status === 'accepted' || r.status === 'rejected'));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    return (
        <AdminLayout title="Accepted/Rejected Password Requests">
            <div className="flex flex-col items-center w-full py-10 px-4">
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
                            <p className="text-gray-600">No accepted or rejected requests found.</p>
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
                                    <ShieldCheck className={`w-5 h-5 ${req.status === 'accepted' ? 'text-green-600' : 'text-red-600'}`} />
                                    <span className="font-semibold text-gray-700">Status:</span>
                                    <span className={`font-bold ${req.status === 'accepted' ? 'text-green-600' : 'text-red-600'}`}>
                                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-700">Requested At:</span>
                                    <span className="text-gray-800">{new Date(req.requestedAt).toLocaleString()}</span>
                                </div>
                                {req.status === 'accepted' && req.acceptedAt && (
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-700">Accepted At:</span>
                                        <span className="text-green-600">{new Date(req.acceptedAt).toLocaleString()}</span>
                                    </div>
                                )}
                                {req.status === 'rejected' && req.rejectedAt && (
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-700">Rejected At:</span>
                                        <span className="text-red-600">{new Date(req.rejectedAt).toLocaleString()}</span>
                                    </div>
                                )}
                                {req.userType && (
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-700">User Type:</span>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            req.userType === 'admin' 
                                                ? 'bg-purple-100 text-purple-700' 
                                                : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {req.userType.charAt(0).toUpperCase() + req.userType.slice(1)}
                                        </span>
                                    </div>
                                )}
                            </div>
                            {req.status === 'rejected' && req.rejectionReason && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                        <span className="font-semibold text-red-700">Rejection Reason:</span>
                                        <p className="text-red-600 text-sm mt-1">{req.rejectionReason}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AcceptedRejectedPasswordRequests;
