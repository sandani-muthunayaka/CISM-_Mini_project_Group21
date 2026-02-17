import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Briefcase, MapPin, Calendar, Clock, User, ChevronLeft, ChevronRight, Shield } from 'lucide-react';
import SideBar from '../functions/SideBar';
import axios from 'axios';
import useRoleAccess from '../utils/useRoleAccess';
import { apiGet, apiPost } from '../utils/api';

const OccupationalHistory = () => {
  const { patientId } = useParams();
  const { canEdit, userPosition, loading: roleLoading } = useRoleAccess();
  const [selectedYear, setSelectedYear] = useState('');
  const [occupation, setOccupation] = useState('');
  const [natureOfWork, setNatureOfWork] = useState('');
  const [workplaceAddress, setWorkplaceAddress] = useState('');
  const [ageOfInitiation, setAgeOfInitiation] = useState('');
  const [durationOfWork, setDurationOfWork] = useState('');
  const [records, setRecords] = useState([]);
  const [allTabs, setAllTabs] = useState({});
  const [error, setError] = useState("");

  const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);
  const ages = Array.from({ length: 80 }, (_, i) => i + 1);
  const durations = ['< 1 year', '1-2 years', '3-5 years', '6-10 years', '11-20 years', '20+ years'];

  // Fetch records from backend on mount
  React.useEffect(() => {
    if (patientId) {
      apiGet(`/patient/${patientId}`)
        .then(data => {
          const backendRecords = data.tab4?.occupationalRecords || [];
          setRecords(backendRecords);
          setAllTabs({
            tab1: data.tab1 || {},
            tab2: data.tab2 || {},
            tab3: data.tab3 || {},
            tab4: {
              ...data.tab4,
              occupationalRecords: backendRecords
            },
            tab5: data.tab5 || {},
            tab6: data.tab6 || {}
          });
        })
        .catch(err => console.error('Error fetching occupational records:', err));
    }
  }, [patientId]);

  const handleAddRecord = async (e) => {
    e.preventDefault();
    if (!selectedYear || !occupation || !natureOfWork || !workplaceAddress || !ageOfInitiation || !durationOfWork) return;
    const newRecord = {
      year: selectedYear,
      occupation,
      natureOfWork,
      workplaceAddress,
      ageOfInitiation,
      durationOfWork,
    };
    try {
      const updatedRecords = [...records, newRecord];
      // Update allTabs with new occupationalRecords
      const updatedTabs = {
        ...allTabs,
        tab4: {
          ...allTabs.tab4,
          occupationalRecords: updatedRecords
        }
      };
      const res = await apiPost('/patient/save', {
        patientId,
        tabs: updatedTabs
      });
      setRecords(res.tab4.occupationalRecords || []);
      setAllTabs(updatedTabs);
      setSelectedYear('');
      setOccupation('');
      setNatureOfWork('');
      setWorkplaceAddress('');
      setAgeOfInitiation('');
      setDurationOfWork('');
      setError('');
    } catch (err) {
      console.error('Error saving occupational record:', err);
      setError(err.message || 'Failed to save occupational record');
    }
  };

  const navigate = () => window.history.back();
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
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Occupational History</h1>
              <p className="text-gray-600">Patient ID: {patientId}</p>
            </div>
          </div>
        </div>

        {/* Occupational History Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className={`grid grid-cols-1 ${canEdit ? 'md:grid-cols-2' : ''} gap-8`}>
            {/* Occupational Records (Left) - Only for doctors and nurses */}
            {canEdit && (
            <div>
              <div className="bg-white rounded-lg shadow-md border border-blue-200">
                <div className="px-8 py-6 border-b-2 border-blue-300 flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-800">Occupational Records</h2>
                </div>
                <form className="p-8 space-y-6" onSubmit={handleAddRecord}>
                  {/* Year Dropdown */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <label className="text-sm font-medium text-gray-700">Year</label>
                    </div>
                    <div className="relative">
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="w-full p-3 rounded-lg border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-700 bg-white appearance-none cursor-pointer"
                      >
                        <option value="">Select year</option>
                        {years.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5 pointer-events-none" />
                    </div>
                  </div>
                  {/* Occupation */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      <label className="text-sm font-medium text-gray-700">Occupation</label>
                    </div>
                    <input
                      type="text"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      className="w-full p-3 rounded-lg border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-700 bg-white"
                      placeholder="Enter occupation"
                    />
                  </div>
                  {/* Nature of Work */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      <label className="text-sm font-medium text-gray-700">Nature of Work</label>
                    </div>
                    <textarea
                      value={natureOfWork}
                      onChange={(e) => setNatureOfWork(e.target.value)}
                      rows={4}
                      className="w-full p-3 rounded-lg border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-700 bg-white resize-none"
                      placeholder="Describe the nature of work"
                    />
                  </div>
                  {/* Age of Initiation */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-blue-600" />
                      <label className="text-sm font-medium text-gray-700">Age of Initiation</label>
                    </div>
                    <div className="relative">
                      <select
                        value={ageOfInitiation}
                        onChange={(e) => setAgeOfInitiation(e.target.value)}
                        className="w-full p-3 rounded-lg border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-700 bg-white appearance-none cursor-pointer"
                      >
                        <option value="">Select age</option>
                        {ages.map(age => (
                          <option key={age} value={age}>{age}</option>
                        ))}
                      </select>
                      <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5 pointer-events-none" />
                    </div>
                  </div>
                  {/* Duration of Work */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <label className="text-sm font-medium text-gray-700">Duration of Work</label>
                    </div>
                    <div className="relative">
                      <select
                        value={durationOfWork}
                        onChange={(e) => setDurationOfWork(e.target.value)}
                        className="w-full p-3 rounded-lg border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-700 bg-white appearance-none cursor-pointer"
                      >
                        <option value="">Select duration</option>
                        {durations.map(duration => (
                          <option key={duration} value={duration}>{duration}</option>
                        ))}
                      </select>
                      <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5 pointer-events-none" />
                    </div>
                  </div>
                  {/* Address of Workplace */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <label className="text-sm font-medium text-gray-700">Address of the Workplace</label>
                    </div>
                    <textarea
                      value={workplaceAddress}
                      onChange={(e) => setWorkplaceAddress(e.target.value)}
                      rows={4}
                      className="w-full p-3 rounded-lg border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-700 bg-white resize-none"
                      placeholder="Enter the complete address of the workplace"
                    />
                  </div>
                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-4 mt-8">
                    <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                      Add <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Error Display */}
                  {error && (
                    <div className="text-red-600 text-sm mt-2">
                      {error}
                    </div>
                  )}
                </form>
              </div>
            </div>
            )}
            {/* All Occupational Records (Right) */}
            <div>
              <div className="bg-white rounded-lg shadow-md border border-blue-200">
                <div className="px-8 py-6 border-b-2 border-blue-300 flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-800">All Occupational Records</h2>
                </div>
                <div className="p-8">
                  {records.length === 0 ? (
                    <div className="text-gray-500 text-center">No records added yet.</div>
                  ) : (
                    <div className="grid gap-6">
                      {records.map((rec, idx) => (
                        <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg shadow-sm p-6 flex flex-col gap-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold text-gray-700">Year:</span>
                            <span className="text-gray-800">{rec.year}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold text-gray-700">Occupation:</span>
                            <span className="text-gray-800">{rec.occupation}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold text-gray-700">Nature of Work:</span>
                            <span className="text-gray-800">{rec.natureOfWork}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold text-gray-700">Address:</span>
                            <span className="text-gray-800">{rec.workplaceAddress}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold text-gray-700">Age of Initiation:</span>
                            <span className="text-gray-800">{rec.ageOfInitiation}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold text-gray-700">Duration:</span>
                            <span className="text-gray-800">{rec.durationOfWork}</span>
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
      </div>
    </SideBar>
  );
};

export default OccupationalHistory;