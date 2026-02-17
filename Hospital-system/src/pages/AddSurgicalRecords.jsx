import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import SideBar from "../functions/SideBar";
import { Calendar, Stethoscope, FileText, History, Shield } from "lucide-react";
import useRoleAccess from '../utils/useRoleAccess';
import { apiGet, apiPost } from '../utils/api';

const AddSurgicalRecords = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const { canEdit, userPosition, loading: roleLoading } = useRoleAccess();
  const today = new Date().toISOString().split("T")[0];
  const [surgery, setSurgery] = useState("");
  const [comment, setComment] = useState("");
  const [surgicalRecords, setSurgicalRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch surgical records from backend
  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const patient = await apiGet(`/patient/${patientId}`);
        const records = patient.tab5?.surgicalRecords || [];
        setSurgicalRecords(records);
        setError("");
      } catch (err) {
        console.error('Error fetching surgical records:', err);
        setError(err.message || "Failed to fetch surgical records");
      } finally {
        setLoading(false);
      }
    };
    if (patientId) fetchRecords();
  }, [patientId]);

  const handleAddSurgery = async () => {
    if (surgery.trim() === "") return;
    const newRecord = { name: surgery, date: today, comments: comment };
    setLoading(true);
    try {
      const updatedPatient = await apiPost("/patient/save", {
        patientId,
        tabs: {
          tab5: {
            surgicalRecords: [...surgicalRecords, newRecord]
          }
        }
      });
      setSurgicalRecords(updatedPatient.tab5.surgicalRecords);
      setSurgery("");
      setComment("");
      setError("");
    } catch (err) {
      console.error('Error saving surgical record:', err);
      setError(err.message || "Failed to save surgical record");
    } finally {
      setLoading(false);
    }
  };

  // patientId now comes from useParams
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
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Surgical History</h1>
              <p className="text-gray-600">Patient ID: {patientId}</p>
            </div>
          </div>
        </div>
        <div className={`grid grid-cols-1 ${canEdit ? 'md:grid-cols-2' : ''} gap-8`}>
          {/* Left: Add New Surgical Record - Only for doctors and nurses */}
          {canEdit && (
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Surgical Record</h2>
              {/* Form for adding surgery */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <label className="text-sm font-medium text-gray-700">Date:</label>
                  </div>
                  <input
                    type="text"
                    value={today}
                    readOnly
                    className="w-full p-3 rounded-lg border-2 border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-blue-600" />
                    <label className="text-sm font-medium text-gray-700">Surgery Name:</label>
                  </div>
                  <input
                    type="text"
                    value={surgery}
                    onChange={(e) => setSurgery(e.target.value)}
                    className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <label className="text-sm font-medium text-gray-700">Comments:</label>
                  </div>
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-700"
                  />
                </div>
                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    className="flex items-center gap-2 px-8 py-3 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-all duration-200 shadow-md hover:shadow-lg"
                    onClick={handleAddSurgery}
                    disabled={loading}
                  >
                    Add Surgery
                  </button>
                </div>
                {error && <div className="text-red-600 mt-2">{error}</div>}
              </div>
            </div>
          </div>
          )}
          {/* Right: Display Surgical History */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Surgical History</h2>
              {/* Display surgical history */}
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-600">{error}</div>
              ) : surgicalRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No surgical history found for this patient.</div>
              ) : (
                <div className="space-y-4">
                  {surgicalRecords.map((record, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
                    >
                      <h4 className="text-gray-800 font-semibold mb-2 flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-blue-600" />
                        {record.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" /> Date: {record.date}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" /> Comments: {record.comments}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SideBar>
  );
};
export default AddSurgicalRecords;
