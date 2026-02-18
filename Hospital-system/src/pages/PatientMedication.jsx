import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SideBar from "../functions/SideBar";
import { Calendar, Pill, FileText, Shield } from "lucide-react";
import useRoleAccess from "../utils/useRoleAccess";
import { apiGet, apiPost } from "../utils/api";
import {
  addMedicationRecord,
  getMedicationRecords,
} from "../services/medication/Medication";

const PatientMedication = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { canEdit, userPosition, loading: roleLoading } = useRoleAccess();
  const [loading, setLoading] = useState(false);
  const [medications, setMedications] = useState([]);
  const [form, setForm] = useState({
    medication: "",
    dosage: "",
    investigation: "",
  });

  const fetchRecords = async () => {
    if (patientId) {
      setLoading(true);
      getMedicationRecords(patientId)
        .then((data) => setMedications(data))
        .catch(() => setError("Failed to fetch medication records"))
        .finally(() => setLoading(false));

      console.log("Data: ", medications);
    }
  };

  React.useEffect(() => {
    fetchRecords();
  }, [patientId]);

  // Handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newMed = {
      ...form,
      date: new Date().toLocaleDateString(),
    };
    const res = await addMedicationRecord(newMed, patientId);
    if (res) {
      try {
        await fetchRecords();
        setForm({ medication: "", dosage: "", investigation: "" });
      } catch (error) {
        alert(
          "Medication saved, but could not update history from server response.",
        );
      }
    } else {
      let errorMsg = "Failed to save medication. Please try again.";
      try {
        const errorData = await res.json();
        errorMsg = errorData.error || errorMsg;
      } catch {
        // If response is not JSON, keep generic error
      }
      alert(errorMsg);
    }
  };

  return (
    <SideBar>
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/patient/${patientId}`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Currently Medication
              </h1>
              <p className="text-gray-600">Patient ID: {patientId}</p>
            </div>
          </div>
        </div>
        <div
          className={`grid grid-cols-1 ${canEdit ? "md:grid-cols-2" : ""} gap-8`}
        >
          {/* Left: Add New Medication - Only for doctors and nurses */}
          {canEdit && (
            <div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Pill className="w-6 h-6 text-blue-600" /> Add
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <label className="text-sm font-medium text-gray-700">
                        Date:
                      </label>
                    </div>
                    <input
                      type="text"
                      value={new Date().toLocaleDateString()}
                      readOnly
                      className="w-full p-3 rounded-lg border-2 border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Pill className="w-4 h-4 text-blue-600" />
                      <label className="text-sm font-medium text-gray-700">
                        Medication:
                      </label>
                    </div>
                    <input
                      type="text"
                      name="medication"
                      value={form.medication}
                      onChange={handleChange}
                      required
                      className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <label className="text-sm font-medium text-gray-700">
                        Dosage:
                      </label>
                    </div>
                    <input
                      type="text"
                      name="dosage"
                      value={form.dosage}
                      onChange={handleChange}
                      required
                      className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <label className="text-sm font-medium text-gray-700">
                        Comments/Investigation:
                      </label>
                    </div>
                    <textarea
                      name="investigation"
                      value={form.investigation}
                      onChange={handleChange}
                      rows={3}
                      className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-700"
                    />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      className="flex items-center gap-2 px-8 py-3 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-all duration-200 shadow-md hover:shadow-lg"
                      onClick={handleSubmit}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Right: Medication History */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" /> Medication
                History
              </h2>
              <div className="overflow-y-auto max-h-[70vh]">
                {medications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No medication history found for this patient.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {medications.map((med, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
                      >
                        <h4 className="text-gray-800 font-semibold mb-2 flex items-center gap-2">
                          <Pill className="w-4 h-4 text-blue-600" />{" "}
                          {med.medication}
                        </h4>
                        <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600" /> Date:{" "}
                          {med.date}
                        </p>
                        <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" /> Dosage:{" "}
                          {med.dosage}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />{" "}
                          Comments/Investigation: {med.comments}
                        </p>
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

export default PatientMedication;
