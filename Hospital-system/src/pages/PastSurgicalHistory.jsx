
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Calendar, User, Stethoscope } from "lucide-react";

// Mock data for demonstration
const mockSurgicalHistory = [
  {
    name: "Appendectomy",
    date: "2021-03-15",
    comments: "Laparoscopic, no complications",
    surgeon: "Dr. Smith"
  },
  {
    name: "Gallbladder Removal",
    date: "2019-11-02",
    comments: "Routine, quick recovery",
    surgeon: "Dr. Lee"
  },
  {
    name: "Hernia Repair",
    date: "2018-06-21",
    comments: "Mesh used, follow-up required",
    surgeon: "Dr. Patel"
  }
];

const PastSurgicalHistory = () => {
  const navigate = useNavigate();
  // In a real app, patient info and surgical history would come from props, context, or API
  const patient = {
    name: "John Doe",
    id: "P123456",
    dob: "1985-07-12"
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <FileText className="w-6 h-6 text-blue-600" />
        Surgical Records
      </h2>
      {mockSurgicalHistory.length === 0 ? (
        <div className="text-center py-12">
          <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No surgical history found for this patient.</h3>
        </div>
      ) : (
        <div className="space-y-6">
          {mockSurgicalHistory.map((record, idx) => (
            <div
              key={idx}
              className="bg-gray-50 p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div>
                <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-2">
                  <Stethoscope className="w-4 h-4 text-blue-600" />
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
                <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Surgeon:</span> {record.surgeon}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PastSurgicalHistory;