import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, FileText, Calendar, User, Baby, AlertCircle, CheckCircle, ChevronRight, HeartPulse, Shield } from "lucide-react";
import SideBar from "../functions/SideBar";
import useRoleAccess from '../utils/useRoleAccess';
import { apiGet, apiPost } from '../utils/api';

const GynHistoryPage = () => {
  const symptoms = [
    "Hot flushes",
    "Night sweats",
    "Tiredness",
    "Palpitations",
    "Anxiety",
    "Poor memory",
    "Urinary symptoms",
    "Isomnia",
    "Irritability",
  ];

  const { patientId } = useParams();
  const { canEdit, userPosition, loading: roleLoading } = useRoleAccess();
  const [patient, setPatient] = useState({ name: "", id: patientId, dob: "" });
  const [gynHistory, setGynHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    consanguineousMarriage: "",
    numberOfPregnancies: "",
    liveBirths: "",
    stillBirths: "",
    livingChildren: "",
    miscarriages: "",
    complications: ["", "", "", ""],
    ageAtMenopause: "",
    symptoms: [],
  });

  // Fetch patient details and Gyn history from backend
  useEffect(() => {
    if (patientId) {
      setLoading(true);
      apiGet(`/patient/${patientId}`)
        .then(data => {
          setPatient({
            name: data.tab1?.name || "",
            id: data.patientId || patientId,
            dob: data.tab1?.dob || ""
          });
          setGynHistory(data.tab6?.gynHistory || null);
          setError("");
        })
        .catch((err) => {
          console.error('Error fetching Gyn history:', err);
          setError(err.message || "Failed to fetch Gyn history");
        })
        .finally(() => setLoading(false));
    }
  }, [patientId]);

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleComplicationChange = (idx, value) => {
    setForm(prev => {
      const updated = [...prev.complications];
      updated[idx] = value;
      return { ...prev, complications: updated };
    });
  };

  const handleSymptomToggle = (symptom) => {
    setForm(prev => {
      const symptoms = prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom];
      return { ...prev, symptoms };
    });
  };

  const getFilledGynHistory = (form) => {
    const filled = {};
    Object.entries(form).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.some(v => v)) filled[key] = value.filter(v => v);
      } else if (Array.isArray(value)) {
        if (value.length > 0) filled[key] = value;
      } else if (typeof value === "string" && value !== "") {
        filled[key] = value;
      }
    });
    return filled;
  };

  const handleAddGynHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const filledGynHistory = getFilledGynHistory(form);
      const data = await apiPost("/patient/save", {
        patientId,
        tabs: {
          tab6: {
            gynHistory: filledGynHistory
          }
        }
      });
      setGynHistory(data.tab6?.gynHistory || filledGynHistory);
      setForm({
        consanguineousMarriage: "",
        numberOfPregnancies: "",
        liveBirths: "",
        stillBirths: "",
        livingChildren: "",
        miscarriages: "",
        complications: ["", "", "", ""],
        ageAtMenopause: "",
        symptoms: [],
      });
    } catch (err) {
      setError(err.message || "Error saving Gyn history");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SideBar>
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Obstetrics and Gynaecological History</h1>
              <p className="text-gray-600">Patient ID: {patient.id}</p>
              {gynHistory && (
                <div className="mt-2 text-sm text-gray-700 bg-blue-50 rounded px-3 py-2">
                  <strong>Saved Gyn History:</strong><br />
                  Consanguineous marriage: {gynHistory.consanguineousMarriage}<br />
                  Number of Pregnancies: {gynHistory.numberOfPregnancies}<br />
                  Live Births: {gynHistory.liveBirths}<br />
                  Still Births: {gynHistory.stillBirths}<br />
                  Living Children: {gynHistory.livingChildren}<br />
                  Miscarriages: {gynHistory.miscarriages}<br />
                  Age at Menopause: {gynHistory.ageAtMenopause}<br />
                  Symptoms: {gynHistory.symptoms?.join(", ")}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gyn History Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            Gyn History Records
          </h2>

          {canEdit && (
          <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* LEFT SECTION */}
            <div className="space-y-6 border border-gray-300 p-4 rounded-md shadow">
              {/* Consanguineous marriage */}
              <div>
                <p className="font-medium mb-1 text-black flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Consanguineous marriage:
                </p>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-black">
                    <input
                      type="radio"
                      name="consanguineousMarriage"
                      checked={form.consanguineousMarriage === "Yes"}
                      onChange={() => handleFormChange("consanguineousMarriage", "Yes")}
                      className="accent-purple-600"
                    />
                    Yes
                  </label>
                  <label className="flex items-center gap-2 text-black">
                    <input
                      type="radio"
                      name="consanguineousMarriage"
                      checked={form.consanguineousMarriage === "No"}
                      onChange={() => handleFormChange("consanguineousMarriage", "No")}
                      className="accent-purple-600"
                    />
                    No
                  </label>
                </div>
              </div>

              {/* Number of Pregnancies */}
              <div>
                <label className="font-medium mb-1 text-black flex items-center gap-2">
                  <Baby className="w-4 h-4 text-blue-600" />
                  Number of Pregnancies
                </label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-1 text-black"
                  value={form.numberOfPregnancies}
                  onChange={e => handleFormChange("numberOfPregnancies", e.target.value)}
                >
                  <option value="">Select count</option>
                  {[...Array(10)].map((_, i) => (
                    <option key={i} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>

              {/* Results */}
              <div>
                <label className="font-medium mb-1 text-black flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  Results of the pregnancies:
                </label>

                <div className="mb-3">
                  <label className="block text-sm mb-1 text-black">Live Births</label>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-1 text-black"
                    value={form.liveBirths}
                    onChange={e => handleFormChange("liveBirths", e.target.value)}
                  >
                    <option value="">Select count</option>
                    {[...Array(10)].map((_, i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="block text-sm mb-1 text-black">Still Births</label>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-1 text-black"
                    value={form.stillBirths}
                    onChange={e => handleFormChange("stillBirths", e.target.value)}
                  >
                    <option value="">Select count</option>
                    {[...Array(10)].map((_, i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="block text-sm mb-1 text-black">No. of living children</label>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-1 text-black"
                    value={form.livingChildren}
                    onChange={e => handleFormChange("livingChildren", e.target.value)}
                  >
                    <option value="">Select count</option>
                    {[...Array(10)].map((_, i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="block text-sm mb-1 text-black">Miscarriages</label>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-1 text-black"
                    value={form.miscarriages}
                    onChange={e => handleFormChange("miscarriages", e.target.value)}
                  >
                    <option value="">Select count</option>
                    {[...Array(10)].map((_, i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* RIGHT SECTION */}
            <div className="space-y-6 border border-gray-300 p-4 rounded-md shadow">
              {/* Complications */}
              <div>
                <p className="font-medium mb-2 text-black flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  Complications during each pregnancy (if present)
                </p>
                {["1st", "2nd", "3rd", "4th"].map((label, idx) => (
                  <div key={label} className="mb-2">
                    <label className="block text-sm mb-1 text-black">{label} pregnancy:</label>
                    <input
                      type="text"
                      placeholder="Describe any complications"
                      value={form.complications[idx]}
                      onChange={e => handleComplicationChange(idx, e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1"
                    />
                  </div>
                ))}
              </div>

              {/* Age at Menopause */}
              <div>
                <label className="font-medium mb-1 text-black flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Age at Menopause
                </label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-1 text-black"
                  value={form.ageAtMenopause}
                  onChange={e => handleFormChange("ageAtMenopause", e.target.value)}
                >
                  <option value="">Select age</option>
                  {[...Array(30)].map((_, i) => (
                    <option key={i} value={35 + i}>{35 + i}</option>
                  ))}
                </select>
              </div>

              {/* Menopause Symptoms */}
              <div>
                <p className="font-medium mb-2 text-black flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Symptoms:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {symptoms.map((symptom) => (
                    <label key={symptom} className="flex items-center gap-2 text-black">
                      <input
                        type="checkbox"
                        className="accent-purple-600"
                        checked={form.symptoms.includes(symptom)}
                        onChange={() => handleSymptomToggle(symptom)}
                      />
                      <span>{symptom}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          /* Buttons //
          <div className="flex justify-center gap-4 mt-10">
            <button
              className="flex items-center gap-2 bg-blue-600 px-6 py-2 rounded text-white hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
              onClick={handleAddGynHistory}
              disabled={loading}
            >
              Add
              <ChevronRight className="w-4 h-4" />
            </button>
            {error && <div className="text-red-600 mt-2">{error}</div>}
          </div>
          </>
          )}
        </div>
      </div>
    </SideBar>
  );
};

export default GynHistoryPage;
