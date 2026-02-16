

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SideBar from "../functions/SideBar";
import ImmunizationRecords from "./ImmunizationRecords";
import PastImmunizationHistory from "./PastImmunizationHistory";
import { Shield } from "lucide-react";
import useRoleAccess from '../utils/useRoleAccess';
import { apiGet } from '../utils/api';

const ImmunizationPage = () => {
  const { patientId } = useParams();
  const { canEdit, userPosition, loading: roleLoading } = useRoleAccess();
  const [immunizationRecords, setImmunizationRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = () => window.history.back();

  // Fetch immunization records from DB on mount and when patientId changes
  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const patient = await apiGet(`/patient/${patientId}`);
        const records = patient.tab4?.immunizationRecords || [];
        setImmunizationRecords(records);
        setError("");
      } catch (err) {
        console.error('Error fetching immunization records:', err);
        setError(err.message || "Failed to fetch immunization records");
      } finally {
        setLoading(false);
      }
    };
    if (patientId) fetchRecords();
  }, [patientId]);

  return (
    <SideBar>
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4">
            <button
              onClick={navigate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {/* Use lucide-react ArrowLeft icon if available */}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Immunization Management</h1>
              <p className="text-gray-600">Patient ID: {patientId}</p>
            </div>
          </div>
        </div>
        <div className={`grid grid-cols-1 ${canEdit ? 'md:grid-cols-2' : ''} gap-8`}>
          {/* Left: Add New Immunization Record - Only for doctors and nurses */}
          {canEdit && (
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Immunization Record</h2>
              <ImmunizationRecords
                patientId={patientId}
                immunizationRecords={immunizationRecords}
                setImmunizationRecords={setImmunizationRecords}
                canEdit={canEdit}
              />
            </div>
          </div>
          )}
          {/* Right: Display Immunization History */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Immunization History</h2>
              <PastImmunizationHistory
                patientId={patientId}
                immunizationRecords={immunizationRecords}
                loading={loading}
                error={error}
              />
            </div>
          </div>
        </div>
      </div>
    </SideBar>
  );
};

export default ImmunizationPage;
