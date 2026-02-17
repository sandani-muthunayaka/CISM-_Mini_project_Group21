import React from 'react';
import { FileText, Users, BookOpen, Hospital, BarChart3 } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

const Reports = () => {
  // State for each report's period
  const [periods, setPeriods] = React.useState({
    patient: 'daily',
    staff: 'daily',
    book: 'daily',
    summary: 'daily',
  });

  // Build query string for download links
  const getQuery = (type) => {
    return `?period=${periods[type]}`;
  };

  return (
    <AdminLayout title="Reports & Analytics">
      <div className="flex flex-col items-center w-full py-10 px-4">
        <div className="w-full max-w-5xl flex flex-col gap-6">
          {/* Patient Summary Report */}
          <div className="flex items-center justify-between bg-white rounded-xl shadow border border-blue-200 px-6 py-4 hover:bg-blue-50 transition">
            <div className="flex items-center gap-3 text-blue-800 font-semibold text-lg">
              <select
                value={periods.patient}
                onChange={e => setPeriods(p => ({ ...p, patient: e.target.value }))}
                className="border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring focus:ring-blue-200 text-gray-400 mr-3"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="annually">Annually</option>
              </select>
              <FileText className="w-6 h-6 text-cyan-600" /> Patient Summary Report
            </div>
            <a
              href={`http://localhost:3000/reports/patient/download${getQuery('patient')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2"
            >
              <FileText className="w-5 h-5" />
            </a>
          </div>
          {/* Staff Activity Report */}
          <div className="flex items-center justify-between bg-white rounded-xl shadow border border-blue-200 px-6 py-4 hover:bg-blue-50 transition">
            <div className="flex items-center gap-3 text-blue-800 font-semibold text-lg">
              <select
                value={periods.staff}
                onChange={e => setPeriods(p => ({ ...p, staff: e.target.value }))}
                className="border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring focus:ring-blue-200 text-gray-400 mr-3"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="annually">Annually</option>
              </select>
              <FileText className="w-6 h-6 text-cyan-600" /> Staff Activity Report
            </div>
            <a
              href={`http://localhost:3000/reports/staff/download${getQuery('staff')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2"
            >
              <FileText className="w-5 h-5" />
            </a>
          </div>
          {/* Book Issuance & Lost Book Report */}
          <div className="flex items-center justify-between bg-white rounded-xl shadow border border-blue-200 px-6 py-4 hover:bg-blue-50 transition">
            <div className="flex items-center gap-3 text-blue-800 font-semibold text-lg">
              <select
                value={periods.book}
                onChange={e => setPeriods(p => ({ ...p, book: e.target.value }))}
                className="border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring focus:ring-blue-200 text-gray-400 mr-3"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="annually">Annually</option>
              </select>
              <BookOpen className="w-6 h-6 text-cyan-600" /> Book Issuance & Lost Book Report
            </div>
            <a
              href={`http://localhost:3000/reports/book/download${getQuery('book')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2"
            >
              <BookOpen className="w-5 h-5" />
            </a>
          </div>
          
          {/* Hospital Summary Report */}
          <div className="flex items-center justify-between bg-white rounded-xl shadow border border-blue-200 px-6 py-4 hover:bg-blue-50 transition">
            <div className="flex items-center gap-3 text-blue-800 font-semibold text-lg">
              <select
                value={periods.summary}
                onChange={e => setPeriods(p => ({ ...p, summary: e.target.value }))}
                className="border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring focus:ring-blue-200 text-gray-400 mr-3"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="annually">Annually</option>
              </select>
              <BarChart3 className="w-6 h-6 text-cyan-600" /> Hospital Summary Report
            </div>
            <a
              href={`http://localhost:3000/reports/summary/download${getQuery('summary')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2"
            >
              <BarChart3 className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Reports;
