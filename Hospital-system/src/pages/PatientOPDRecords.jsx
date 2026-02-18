import React from 'react';
import SideBar from '../functions/SideBar';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, User, Stethoscope, Shield } from 'lucide-react';
import useRoleAccess from '../utils/useRoleAccess';
import { apiGet, apiPost } from '../utils/api';
import { addOpdRecord, getOpdRecords } from "../services/opd/Opd";

const PatientOPDRecords = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { canEdit, userPosition, loading: roleLoading } = useRoleAccess();
  const [records, setRecords] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [form, setForm] = React.useState({
    date: new Date().toLocaleDateString(),
    symptoms: "",
    treatment: "",
    investigation: ""
  });

  React.useEffect(() => {
    if (patientId) {
      setLoading(true);
      getOpdRecords(patientId)
        .then((data) => setRecords(data))
        .catch(() => setError("Failed to fetch OPD records"))
        .finally(() => setLoading(false));
    }
  }, [patientId]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const newRecord = { ...form };
    try {
      const updatedList = await apiPost(`/patient/${patientId}/opd`, newRecord);
      setRecords(updatedList);
      setForm({
        date: new Date().toLocaleDateString(),
        symptoms: "",
        treatment: "",
        investigation: ""
      });
    } catch (error) {
      console.error('Error saving OPD record:', error);
      alert(error.message || "Failed to save OPD record. Please try again.");
    }
  };

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
              <h1 className="text-2xl font-bold text-gray-800">OPD Records</h1>
              <p className="text-gray-600">Patient ID: {patientId}</p>
            </div>
          </div>
        </div>
        <div className={`grid grid-cols-1 ${canEdit ? 'md:grid-cols-2' : ''} gap-8`}>
          {/* Left: Add New OPD Record - Only for doctors and nurses */}
          {canEdit && (
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Stethoscope className="w-6 h-6 text-blue-600" /> Add OPD Record
              </h2>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <label className="text-sm font-medium text-gray-700">Date:</label>
                  </div>
                  <input
                    type="text"
                    name="date"
                    value={form.date}
                    readOnly
                    className="w-full p-3 rounded-lg border-2 border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <label className="text-sm font-medium text-gray-700">Symptoms/Tentative Diagnosis:</label>
                  </div>
                  <input
                    type="text"
                    name="symptoms"
                    value={form.symptoms}
                    onChange={handleChange}
                    required
                    className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <label className="text-sm font-medium text-gray-700">Treatment:</label>
                  </div>
                  <input
                    type="text"
                    name="treatment"
                    value={form.treatment}
                    onChange={handleChange}
                    required
                    className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <label className="text-sm font-medium text-gray-700">Investigation:</label>
                  </div>
                  <input
                    type="text"
                    name="investigation"
                    value={form.investigation}
                    onChange={handleChange}
                    required
                    className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-700"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-8 py-3 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
          )}
          {/* Right: OPD History */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" /> OPD History
              </h2>
              <div className="overflow-y-auto max-h-[70vh]">
                {loading ? (
                  <div className="text-center py-12">Loading...</div>
                ) : error ? (
                  <div className="text-center py-12 text-red-500">{error}</div>
                ) : records.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">No OPD records found.</div>
                ) : (
                  <div className="space-y-4">
                    {records.map((rec, idx) => (
                      <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                        <div className="font-semibold text-gray-800">Date: {rec.date}</div>
                        <div className="text-gray-700">Symptoms/Tentative Diagnosis: {rec.symptoms}</div>
                        <div className="text-gray-700">Treatment: {rec.treatment}</div>
                        <div className="text-gray-700">Investigation: {rec.investigation}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SideBar>
  );
};


export default PatientOPDRecords;
