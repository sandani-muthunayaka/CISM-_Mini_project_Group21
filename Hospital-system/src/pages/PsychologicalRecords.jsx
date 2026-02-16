import React, { useState, useEffect } from "react";
import { Calendar, Brain, FileText, History, Shield } from "lucide-react";
import useRoleAccess from '../utils/useRoleAccess';
import { apiGet, apiPost } from '../utils/api';

const PsychologicalRecords = ({ patientId, onHistoryUpdate }) => {
  const { canEdit, userPosition, loading: roleLoading } = useRoleAccess();
  const today = new Date().toISOString().split("T")[0];
  const [psychological, setPsychological] = useState("");
  const [comment, setComment] = useState("");
  const [records, setRecords] = useState([]);

  const [allTabs, setAllTabs] = useState({});
  useEffect(() => {
    if (patientId) {
      apiGet(`/patient/${patientId}`)
        .then((data) => {
          const backendRecords = data.tab4?.psychologicalRecords || [];
          setRecords(backendRecords);
          // Store all tab data for saving
          setAllTabs({
            tab1: data.tab1 || {},
            tab2: data.tab2 || {},
            tab3: data.tab3 || {},
            tab4: {
              ...data.tab4,
              psychologicalRecords: backendRecords
            },
            tab5: data.tab5 || {},
            tab6: data.tab6 || {}
          });
        })
        .catch(err => console.error('Error fetching psychological records:', err));
    }
  }, [patientId]);

  const handleAddRecord = async () => {
    if (psychological.trim() === "") return;
    const newRecord = { name: psychological, date: today, comments: comment };
    const updatedRecords = [...records, newRecord];
    setRecords(updatedRecords);
    setPsychological("");
    setComment("");
    // Update allTabs with new psychologicalRecords
    const updatedTabs = {
      ...allTabs,
      tab4: {
        ...allTabs.tab4,
        psychologicalRecords: updatedRecords
      }
    };
    setAllTabs(updatedTabs);
    // Save all tab data to backend
    await apiPost("/patient/save", {
      patientId,
      tabs: updatedTabs
    });
    if (onHistoryUpdate) {
      onHistoryUpdate(updatedRecords);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Left side: Add Psychological Record - Only for doctors and nurses */}
      {canEdit && (
      <div className="flex flex-col h-full min-h-[400px] bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Add New Psychological Disease
            </h3>
          </div>
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
                <Brain className="w-4 h-4 text-blue-600" />
                <label className="text-sm font-medium text-gray-700">
                  Psychological Disease conditions:
                </label>
              </div>
              <input
                type="text"
                value={psychological}
                onChange={(e) => setPsychological(e.target.value)}
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
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                onClick={handleAddRecord}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
      {/* Right side: Past Psychological History */}
      <div className="flex flex-col h-full min-h-[400px] bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <FileText className="w-6 h-6 text-blue-600" />
          Psychological History
        </h2>
        {records.length === 0 ? (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2"> No records loading yet</h3>
          </div>
        ) : (
          <div className="space-y-6">
            {records.map((record, idx) => (
              <div
                key={idx}
                className="bg-gray-50 p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition-all flex flex-col gap-4"
              >
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-blue-600" />
                    {record.name}
                  </h4>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Date:</span> {record.date}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Comments:</span> {record.comments}
                  </p>
                  {/* Optionally add doctor field if available */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PsychologicalRecords;
