import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, FileText, Hospital, User, Hash, FileText as ReportIcon } from 'lucide-react';

const sidebarItems = [
  { label: 'Home', path: '/dashboard', icon: <Home className="w-5 h-5 mr-2" /> },
  { label: 'Reports & Alerts', path: '/reports', icon: <FileText className="w-5 h-5 mr-2" /> },
];

const StaffReport = () => {
  const [staff, setStaff] = useState([]);
  useEffect(() => {
    fetch('http://localhost:3000/reports/staff')
      .then(res => res.json())
      .then(data => setStaff(data));
  }, []);
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300">
      {/* Sidebar */}
      <div className="w-64 min-h-screen bg-gradient-to-b from-blue-700 via-blue-600 to-cyan-600 shadow-xl flex flex-col divide-y divide-blue-500 text-white">
        <nav className="flex-1 flex flex-col py-4">
          {sidebarItems.map((item, idx) => (
            <Link
              key={idx}
              to={item.path}
              className={`flex items-center px-6 py-3 hover:bg-blue-500/60 transition rounded-r-full font-medium text-white/90 hover:text-white`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center w-full py-10 px-4">
        {/* Hospital Bar */}
        <div className="w-full max-w-xl mb-2">
          <div className="bg-blue-700 rounded-t-xl py-3 px-6 text-center">
            <span className="text-white text-lg font-bold tracking-wide">Base Hospital - Avissawella</span>
          </div>
        </div>
        {/* Header */}
        <div className="w-full max-w-xl mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-800 flex items-center gap-3 bg-white rounded-b-xl py-6 px-6 shadow">
            <ReportIcon className="w-7 h-7 text-cyan-600" />
            Staff Activity Report
          </h1>
        </div>
        {/* Download PDF Button */}
        <div className="w-full max-w-xl mb-4 flex justify-end">
          <a
            href="http://localhost:3000/reports/staff/download"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow flex items-center gap-2"
          >
            <ReportIcon className="w-5 h-5" /> Download PDF
          </a>
        </div>
      </div>
    </div>
  );
};

export default StaffReport;
