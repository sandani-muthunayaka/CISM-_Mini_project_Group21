import React, { useEffect, useState } from 'react';
import { CheckCircle, User, Hash, MapPin, Phone, IdCard, Landmark, Calendar, ArrowLeft } from 'lucide-react';
import SideBar from "../functions/SideBar";
import { useLocation } from 'react-router-dom';
import { generatePatientId } from '../utils/patientIdGenerator';
import { useNavigate } from 'react-router-dom';

const SuccessfulRegistration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [patientData, setPatientData] = useState(null);
  const [patientId, setPatientId] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('patientId');
    if (id) setPatientId(id);
  }, [location]);

  return (
    <SideBar>
      <div className="flex justify-center items-center min-h-[80vh] px-4">
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 max-w-lg w-full p-8 flex flex-col items-center">
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Registration Successful!</h2>
          <p className="text-gray-600 mb-6 text-center">Your patient registration has been completed successfully. Please find your details below.</p>
          
          {/* Patient ID Display */}
          <div className="flex flex-col items-center bg-blue-50 border border-blue-300 rounded-lg px-6 py-3 mb-6 shadow-sm w-full">
            <div className="flex items-center gap-2 mb-1">
              <Hash className="w-6 h-6 text-blue-600" />
              <span className="font-semibold text-blue-700">Patient ID:</span>
            </div>
            <span className="text-xl font-extrabold text-blue-700 tracking-wide">{patientId}</span>
          </div>

          {/* Patient Details removed as requested */}

          {/* Success Message */}
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-center text-sm">
              Your patient registration is complete. You can now access all patient services.
            </p>
            <div className="flex justify-center w-full">
              <button
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="w-5 h-5" />
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </SideBar>
  );
};

export default SuccessfulRegistration; 