import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SideBar from "../functions/SideBar";
import { ArrowLeft, FileText, Calendar, User, Brain } from "lucide-react";
import PsychologicalRecords from "./PsychologicalRecords";

const PastPsychologicalHistory = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState({ name: "", id: patientId, dob: "" });
  const [psychologicalHistory, setPsychologicalHistory] = useState([]);

  useEffect(() => {
    // Fetch patient details and psychological history from backend if patientId exists
    if (patientId) {
      fetch(`http://localhost:3000/patient/${patientId}`)
        .then(res => res.json())
        .then(data => {
          setPatient({
            name: data.tab1?.name || "",
            id: data.patientId || patientId,
            dob: data.tab1?.dob || ""
          });
          setPsychologicalHistory(data.tab4?.psychologicalRecords || []);
        });
    }
  }, [patientId]);

  // Handler to update history after adding new record
  const handleHistoryUpdate = () => {
    // Re-fetch from backend to ensure latest data
    if (patientId) {
      fetch(`http://localhost:3000/patient/${patientId}`)
        .then(res => res.json())
        .then(data => {
          setPsychologicalHistory(data.tab4?.psychologicalRecords || []);
        });
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
              <h1 className="text-2xl font-bold text-gray-800">Past Psychological Disease History</h1>
              <p className="text-gray-600">Patient ID: {patient.id}</p>
            </div>
          </div>
        </div>

        {/* Psychological History Content */}
        
          {/* Left side: PsychologicalRecords component */}
          <div className="flex flex-col h-full min-h-[400px] bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <PsychologicalRecords patientId={patientId} onHistoryUpdate={handleHistoryUpdate} />
          </div>
          {/* Right side: Past Psychological History */}
        
      </div>
    </SideBar>
  );
};

export default PastPsychologicalHistory;