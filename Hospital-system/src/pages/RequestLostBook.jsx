
import React, { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import StaffLayout from '../components/StaffLayout';



const RequestLostBook = () => {
  const [patientId, setPatientId] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    try {
      const response = await fetch('http://localhost:3000/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Lost book request for Patient ID: ${patientId}. Reason: ${reason}`,
          type: 'lost_book',
        }),
      });
      if (!response.ok) throw new Error('Failed to send request');
      setSuccess(true);
      setMessage('Request sent successfully!');
      setPatientId('');
      setReason('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <StaffLayout title="Request a Lost Book">
      <div className="flex flex-col items-center w-full py-10 px-4">
        {/* Form */}
        <div className="w-full max-w-5xl bg-white shadow-lg rounded-lg p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Patient ID"
              value={patientId}
              onChange={e => setPatientId(e.target.value)}
              required
              className="border rounded px-3 py-2 text-gray-700"
            />
            <textarea
              placeholder="Reason for lost book"
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
              className="border rounded px-3 py-2 text-gray-700"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold"
            >
              Submit Request
            </button>
          </form>
          {success && <div className="mt-4 text-green-600">{message}</div>}
          {error && <div className="mt-4 text-red-600">Error: {error}</div>}
        </div>
      </div>
    </StaffLayout>
  );
};

export default RequestLostBook;
