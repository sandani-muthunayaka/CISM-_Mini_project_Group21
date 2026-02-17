import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SideBar from '../functions/SideBar';
import { ArrowLeft, FileText, Heart, Calendar, User } from 'lucide-react';


const PatientLifestyles = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [records, setRecords] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (patientId) {
      setLoading(true);
      fetch(`http://localhost:3000/patient/${patientId}`)
        .then(res => res.json())
        .then(data => {
          setRecords(data.tab3?.lifestyleRecords || []);
          setError("");
        })
        .catch(() => setError("Failed to fetch lifestyle records"))
        .finally(() => setLoading(false));
    }
  }, [patientId]);

  return (
    <SideBar>
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/patient/${patientId}`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Lifestyle Information</h1>
              <p className="text-gray-600">Patient ID: {patientId}</p>
            </div>
          </div>
        </div>
        {/* Lifestyle Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <Heart className="w-6 h-6 text-blue-600" />
            Lifestyle Information
          </h2>
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : records.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No lifestyle records found.</div>
          ) : (
            <div className="space-y-4">
              {records.map((rec, idx) => (
                <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                  <div className="font-semibold">Date: {rec.date}</div>
                  <div>Type: {rec.type}</div>
                  <div>Details: {rec.details}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SideBar>
  );
};

export default PatientLifestyles;
