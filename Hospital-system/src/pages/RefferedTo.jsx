import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Calendar, User, Building, Phone, Mail, MapPin, Stethoscope, FileText, Clock, AlertCircle, Shield } from "lucide-react";
import SideBar from "../functions/SideBar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import useRoleAccess from '../utils/useRoleAccess';
import { apiGet, apiPost } from '../utils/api';

const RefferedTo = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const { canEdit, userPosition, loading: roleLoading } = useRoleAccess();
  const today = new Date().toISOString().split("T")[0]; // Get today's date
  const [referralData, setReferralData] = useState({
    referringDoctor: "",
    referredToDoctor: "",
    referredToHospital: "",
    referredToDepartments: [],
    referralReason: "",
    urgency: "",
    appointmentDate: null,
    contactNumber: "",
    email: "",
    address: "",
    notes: ""
  });
  const [referralRecords, setReferralRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch referral records from backend
  React.useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const patient = await apiGet(`/patient/${patientId}`);
        const records = patient.tab6?.referralRecords || [];
        setReferralRecords(records);
        setError("");
      } catch (err) {
        console.error('Error fetching referral records:', err);
        setError(err.message || "Failed to fetch referral records");
      } finally {
        setLoading(false);
      }
    };
    if (patientId) fetchRecords();
  }, [patientId]);

  const handleInputChange = (field, value) => {
    setReferralData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddReferral = async () => {
    if (referralData.referredToDoctor.trim() === "" || referralData.referredToDepartments.length === 0) return;
    const newRecord = {
      referredToDoctor: referralData.referredToDoctor,
      referredToHospital: referralData.referredToHospital,
      referredToDepartments: referralData.referredToDepartments,
      date: today,
      urgency: referralData.urgency,
      status: "Pending"
    };
    setLoading(true);
    try {
      const updatedPatient = await apiPost("/patient/save", {
        patientId,
        tabs: {
          tab6: {
            referralRecords: [...referralRecords, newRecord]
          }
        }
      });
      setReferralRecords(updatedPatient.tab6.referralRecords);
      setReferralData({
        referringDoctor: "",
        referredToDoctor: "",
        referredToHospital: "",
        referredToDepartments: [],
        referralReason: "",
        urgency: "",
        appointmentDate: null,
        contactNumber: "",
        email: "",
        address: "",
        notes: ""
      });
      setError("");
    } catch (err) {
      setError("Failed to save referral record");
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'in progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const InputField = ({ field, label, type = "text", placeholder, icon: Icon }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-blue-600" />}
        <label className="text-sm font-medium text-gray-700">{label}:</label>
      </div>
      <input
        type={type}
        value={referralData[field]}
        onChange={(e) => handleInputChange(field, e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-700"
      />
    </div>
  );

  const DatePickerField = ({ field, label, icon: Icon }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-blue-600" />}
        <label className="text-sm font-medium text-gray-700">{label}:</label>
      </div>
      <DatePicker
        selected={referralData[field]}
        onChange={date => handleInputChange(field, date)}
        dateFormat="yyyy-MM-dd"
        className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-700"
        placeholderText={label}
      />
    </div>
  );

  const SelectField = ({ field, label, options, icon: Icon }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-blue-600" />}
        <label className="text-sm font-medium text-gray-700">{label}:</label>
      </div>
      <select
        value={referralData[field]}
        onChange={(e) => handleInputChange(field, e.target.value)}
        className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-700 bg-white"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );

  const TextAreaField = ({ field, label, placeholder, icon: Icon }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-blue-600" />}
        <label className="text-sm font-medium text-gray-700">{label}:</label>
      </div>
      <textarea
        value={referralData[field]}
        onChange={(e) => handleInputChange(field, e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-700 resize-none"
      />
    </div>
  );

  const CheckboxGroup = ({ field, label, options, icon: Icon }) => {
    const handleCheckboxChange = (option) => {
      const currentDepartments = referralData[field] || [];
      const updatedDepartments = currentDepartments.includes(option)
        ? currentDepartments.filter(dept => dept !== option)
        : [...currentDepartments, option];
      
      handleInputChange(field, updatedDepartments);
    };

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-blue-600" />}
          <label className="text-sm font-medium text-gray-700">{label}:</label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {options.map((option) => (
            <label key={option} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={referralData[field]?.includes(option) || false}
                onChange={() => handleCheckboxChange(option)}
                className="w-4 h-4 text-blue-600 border-2 border-gray-300 focus:ring-blue-500 focus:ring-2 transition-all"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                {option}
              </span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  return (
    <SideBar>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-8">
            <div className={`grid ${canEdit ? 'md:grid-cols-2' : 'grid-cols-1'} gap-8`}>
              {/* Left Column - Add New Referral - Only for doctors and nurses */}
              {canEdit && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Add New Referral
                  </h3>
                </div>

                <div className="space-y-4">
                  <InputField
                    field="referringDoctor"
                    label="Referring Doctor"
                    placeholder="Your name"
                    icon={User}
                  />

                  <InputField
                    field="referredToDoctor"
                    label="Referred To Doctor"
                    placeholder="Specialist's name"
                    icon={Stethoscope}
                  />

                  <CheckboxGroup
                    field="referredToDepartments"
                    label="Departments"
                    icon={Building}
                    options={[
                      "Cardiology",
                      "Neurology",
                      "Orthopedics",
                      "Oncology",
                      "Dermatology",
                      "Psychiatry",
                      "Pediatrics",
                      "General Surgery",
                      "Internal Medicine",
                      "Emergency Medicine",
                      "Radiology",
                      "Pathology",
                      "Other"
                    ]}
                  />

                  <TextAreaField
                    field="referralReason"
                    label="Reason for Referral"
                    placeholder="Describe the reason for referral..."
                    icon={FileText}
                  />

                  <SelectField
                    field="urgency"
                    label="Urgency Level"
                    icon={AlertCircle}
                    options={["Low", "Medium", "High", "Emergency"]}
                  />

                  <DatePickerField
                    field="appointmentDate"
                    label="Preferred Appointment Date"
                    icon={Calendar}
                  />

                  <InputField
                    field="contactNumber"
                    label="Contact Number"
                    placeholder="Hospital/Doctor contact"
                    icon={Phone}
                  />

                  <InputField
                    field="email"
                    label="Email Address"
                    type="email"
                    placeholder="Hospital/Doctor email"
                    icon={Mail}
                  />

                  <TextAreaField
                    field="notes"
                    label="Additional Notes"
                    placeholder="Any additional information..."
                    icon={FileText}
                  />

                  {/* Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                      onClick={handleAddReferral}
                    >
                      Add
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              )}

              {/* Right Column - Referral History */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Referral History
                  </h3>
                </div>

                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading...</div>
                  ) : error ? (
                    <div className="text-center py-8 text-red-600">{error}</div>
                  ) : referralRecords.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No referral history found for this patient.</div>
                  ) : (
                    referralRecords.map((record, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-gray-800 font-semibold">
                            {record.referredToDoctor}
                          </h4>
                          <div className="flex gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(record.urgency)}`}>
                              {record.urgency}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
                              {record.status}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p><span className="font-medium">Referred to:</span> {record.referredToDoctor}</p>
                          <p><span className="font-medium">Departments:</span> {record.referredToDepartments?.join(", ") || "Not specified"}</p>
                          <p><span className="font-medium">Date:</span> {record.date}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Summary Stats */}
                {/* <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="text-blue-800 font-semibold mb-2">Referral Summary</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-blue-600 font-bold">{referralRecords.length}</div>
                      <div className="text-blue-500">Total Referrals</div>
                    </div>
                    <div className="text-center">
                      <div className="text-orange-600 font-bold">
                        {referralRecords.filter(r => r.status === 'Pending').length}
                      </div>
                      <div className="text-orange-500">Pending</div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-600 font-bold">
                        {referralRecords.filter(r => r.status === 'Completed').length}
                      </div>
                      <div className="text-green-500">Completed</div>
                    </div>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SideBar>
  );
};

export default RefferedTo;
