import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SideBar from '../functions/SideBar';
import { ArrowLeft, User, Hash, IdCard, Calendar, Phone, MapPin } from 'lucide-react';
import { Heart } from 'lucide-react';
import { apiGet } from '../utils/api';

const PatientDetail = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch patient details
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        const data = await apiGet(`/patient/${patientId}`);
        setPatient(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching patient:', err);
        setError(err.message || 'Failed to load patient details');
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatient();
    }
  }, [patientId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading patient details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <button 
              onClick={() => navigate('/patientRecords')} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Back to Patient Records
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SideBar>
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/patientRecords')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Records
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Patient: {patient?.tab1?.name || patient?.patientId || 'Unknown'}
              </h1>
              <p className="text-gray-600">Patient ID: {patient?.patientId || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Personal Details Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <User className="w-6 h-6 text-blue-600" />
            Personal Details
          </h2>
          {patient?.tab1 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Basic Information</h3>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-700">Name:</span>
                  <span className="text-gray-800">{patient.tab1.name || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Hash className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-700">Patient ID:</span>
                  <span className="text-gray-800 font-mono">{patient.patientId || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <IdCard className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-700">NIC:</span>
                  <span className="text-gray-800 font-mono">{patient.tab1.nic || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-700">Date of Birth:</span>
                  <span className="text-gray-800">{patient.tab1.dob || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold text-gray-700">Marital Status:</span>
                  <span className="text-gray-800">{patient.tab1.maritalStatus || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-700">Phone Number:</span>
                  <span className="text-gray-800">{patient.tab1.phone || 'N/A'}</span>
                </div>
              </div>

              {/* Emergency Contact Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Emergency Contact Details</h3>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-700">Name:</span>
                  <span className="text-gray-800">{patient.tab1.emergencyContactName || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <IdCard className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-700">Relationship:</span>
                  <span className="text-gray-800">{patient.tab1.emergencyContactRelationship || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-700">Phone:</span>
                  <span className="text-gray-800">{patient.tab1.emergencyContactPhone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-700">Gender:</span>
                  <span className="text-gray-800">{patient.tab1.emergencyContactGender || 'N/A'}</span>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Contact Details</h3>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-700">Address:</span>
                  <span className="text-gray-800">{patient.tab1.address || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-700">District:</span>
                  <span className="text-gray-800">{patient.tab1.district || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-700">MOH Area:</span>
                  <span className="text-gray-800">{patient.tab1.mohArea || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-700">PHM Area:</span>
                  <span className="text-gray-800">{patient.tab1.phmArea || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-700">PHI Area:</span>
                  <span className="text-gray-800">{patient.tab1.phiArea || 'N/A'}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No personal details available</p>
          )}
        </div>
      </div>
    </SideBar>
  );
};

export default PatientDetail;
