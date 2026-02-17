import React, { useEffect, useState } from 'react';
import { FileText, FileText as ReportIcon } from 'lucide-react';
import StaffLayout from '../components/StaffLayout';



const PatientReport = () => {
  const [patients, setPatients] = useState([]);
  useEffect(() => {
    fetch('http://localhost:3000/reports/patient')
      .then(res => res.json())
      .then(data => setPatients(data));
  }, []);
  return (
    <StaffLayout title="Patient Reports">
      <div className="flex flex-col items-center w-full py-10 px-4">
        {/* Download PDF Button */}
        <div className="w-full max-w-xl mb-4 flex justify-end">
          <a
            href="http://localhost:3000/reports/patient/download"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow flex items-center gap-2"
          >
            <ReportIcon className="w-5 h-5" /> Download PDF
          </a>
        </div>
      </div>
    </StaffLayout>
  );
};

export default PatientReport; 