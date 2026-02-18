import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import SideBar from "../functions/SideBar";
import { ArrowLeft, FileText, Building2, Calendar, User } from "lucide-react";
import {
  addHospitalizationRecord,
  getHospitalizationRecords,
} from "../services/hospitalization/Hospitalization";

const PatientHospitalization = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [records, setRecords] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [form, setForm] = React.useState({
    date: new Date().toLocaleDateString(),
    hospitalName: "Base Hospital - Avissawella",
    diagnosis: "",
    referral: "",
  });

  const fetchRecords = async () => {
    if (patientId) {
      setLoading(true);
      getHospitalizationRecords(patientId)
        .then((data) => setRecords(data))
        .catch(() => setError("Failed to fetch hospitalization records"))
        .finally(() => setLoading(false));

      console.log("Data: ", records);
    }
  };

  React.useEffect(() => {
    fetchRecords();
  }, [patientId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newRecord = { ...form };
    const res = await addHospitalizationRecord(newRecord, patientId);
    if (res) {
      try {
        await fetchRecords();
        setForm({
          date: new Date().toLocaleDateString(),
          hospitalName: "Base Hospital - Avissawella",
          diagnosis: "",
          referral: "",
        });
      } catch {
        alert(
          "Record saved, but could not update history from server response.",
        );
      }
    } else {
      let errorMsg = "Failed to save record. Please try again.";
      try {
        const errorData = await res.json();
        errorMsg = errorData.error || errorMsg;
      } catch {}
      alert(errorMsg);
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
              <h1 className="text-2xl font-bold text-gray-800">
                Hospitalization Records
              </h1>
              <p className="text-gray-600">Patient ID: {patientId}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Add New Hospitalization Record */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-blue-600" /> Add
                Hospitalization
              </h2>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <label className="text-sm font-medium text-gray-700">
                      Date:
                    </label>
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
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <label className="text-sm font-medium text-gray-700">
                      Hospital Name:
                    </label>
                  </div>
                  <select
                    name="hospitalName"
                    value={form.hospitalName}
                    onChange={handleChange}
                    required
                    className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-700"
                  >
                    <option value="Base Hospital - Rathnapura">
                      General Hospital - Colombo
                    </option>
                    <option value="Base Hospital - Avissawella">
                      Base Hospital - Avissawella
                    </option>
                    <option value="Base Hospital - Karawanella">
                      Base Hospital - Karawanella
                    </option>
                    <option value="Base Hospital - Colombo">
                      Base Hospital - Colombo
                    </option>
                    <option value="Base Hospital - Rathnapura">
                      Base Hospital - Rathnapura
                    </option>
                    <option value="Base Hospital - Rathnapura">
                      Base Hospital - Kegalle
                    </option>
                  </select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <label className="text-sm font-medium text-gray-700">
                      Diagnosis:
                    </label>
                  </div>
                  <input
                    type="text"
                    name="diagnosis"
                    value={form.diagnosis}
                    onChange={handleChange}
                    required
                    className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <label className="text-sm font-medium text-gray-700">
                      Back Referral/Follow Up:
                    </label>
                  </div>
                  <input
                    type="text"
                    name="referral"
                    value={form.referral}
                    onChange={handleChange}
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
          {/* Right: Hospitalization History */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" /> Hospitalization
                History
              </h2>
              <div className="overflow-y-auto max-h-[70vh]">
                {loading ? (
                  <div className="text-center py-12">Loading...</div>
                ) : error ? (
                  <div className="text-center py-12 text-red-500">{error}</div>
                ) : records.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No hospitalization records found.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {records.map((rec, idx) => (
                      <div
                        key={idx}
                        className="border rounded-lg p-4 bg-gray-50"
                      >
                        <div className="font-semibold text-gray-800">
                          Date: {rec.date}
                        </div>
                        <div className="text-gray-700">
                          Hospital: {rec.hospitalName}
                        </div>
                        <div className="text-gray-700">
                          Diagnosis: {rec.diagnosis}
                        </div>
                        <div className="text-gray-700">
                          Back Referral/Follow Up: {rec.referral}
                        </div>
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

export default PatientHospitalization;
