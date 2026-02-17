
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Calendar, Syringe, Shield, FileText, History, AlertCircle, CheckCircle } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { apiGet, apiPost } from '../utils/api';

const ImmunizationRecords = ({ patientId: propPatientId, immunizationRecords, setImmunizationRecords }) => {
  const params = useParams();
  const patientId = propPatientId || params.patientId;
  const today = new Date().toISOString().split("T")[0];
  const [immunizationData, setImmunizationData] = useState({
    vaccineName: "",
    vaccineType: "",
    doseNumber: "",
    dateGiven: null,
    nextDueDate: null,
    batchNumber: "",
    manufacturer: "",
    administeredBy: "",
    site: "",
    route: "",
    adverseReaction: "",
    notes: "",
    status: "Pending"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (field, value) => {
    setImmunizationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const [allTabs, setAllTabs] = useState({});

  useEffect(() => {
    if (patientId) {
      apiGet(`/patient/${patientId}`)
        .then(data => {
          setAllTabs({
            tab1: data.tab1 || {},
            tab2: data.tab2 || {},
            tab3: data.tab3 || {},
            tab4: {
              ...data.tab4,
              immunizationRecords: data.tab4?.immunizationRecords || []
            },
            tab5: data.tab5 || {},
            tab6: data.tab6 || {}
          });
        })
        .catch(err => {
          console.error('Error fetching patient data:', err);
          setError('Failed to fetch patient data');
        });
    }
  }, [patientId]);

  const handleAddImmunization = async () => {
    if (!immunizationData.vaccineName.trim() || !immunizationData.dateGiven) return;
    const newRecord = {
      ...immunizationData,
      dateGiven: immunizationData.dateGiven ? immunizationData.dateGiven.toISOString().split("T")[0] : "",
      nextDueDate: immunizationData.nextDueDate ? immunizationData.nextDueDate.toISOString().split("T")[0] : ""
    };
    try {
      setLoading(true);
      // Update allTabs with new immunizationRecords
      const updatedTabs = {
        ...allTabs,
        tab4: {
          ...allTabs.tab4,
          immunizationRecords: [...(allTabs.tab4?.immunizationRecords || []), newRecord]
        }
      };
      const res = await apiPost("/patient/save", {
        patientId,
        tabs: updatedTabs
      });
      setImmunizationRecords(res.tab4.immunizationRecords);
      setAllTabs(updatedTabs);
      // Clear form
      setImmunizationData({
        vaccineName: "",
        vaccineType: "",
        doseNumber: "",
        dateGiven: null,
        nextDueDate: null,
        batchNumber: "",
        manufacturer: "",
        administeredBy: "",
        site: "",
        route: "",
        adverseReaction: "",
        notes: "",
        status: "Pending"
      });
    } catch (err) {
      setError("Failed to save immunization record");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'pending': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'overdue': return 'text-red-600 bg-red-50 border-red-200';
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
        value={immunizationData[field]}
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
        selected={immunizationData[field]}
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
        value={immunizationData[field]}
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
        value={immunizationData[field]}
        onChange={(e) => handleInputChange(field, e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-700 resize-none"
      />
    </div>
  );

  return (
    <div>
      {/* Add New Immunization */}
      <div className="flex items-center gap-2 mb-4">
        <Syringe className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">
          Add New Immunization
        </h3>
      </div>
      <div className="space-y-4">
        <InputField
          field="vaccineName"
          label="Vaccine Name"
          placeholder="Enter vaccine name"
          icon={Shield}
        />
        <SelectField
          field="vaccineType"
          label="Vaccine Type"
          icon={Syringe}
          options={["Live attenuated","Inactivated","Subunit","Toxoid","Conjugate","Recombinant","Other"]}
        />
        <div className="grid grid-cols-2 gap-4">
          <InputField
            field="doseNumber"
            label="Dose Number"
            type="number"
            placeholder="1, 2, 3..."
          />
          <InputField
            field="batchNumber"
            label="Batch Number"
            placeholder="Batch/Lot number"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <DatePickerField
            field="dateGiven"
            label="Date Given"
            icon={Calendar}
          />
          <DatePickerField
            field="nextDueDate"
            label="Next Due Date"
            icon={Calendar}
          />
        </div>
        <InputField
          field="manufacturer"
          label="Manufacturer"
          placeholder="Vaccine manufacturer"
        />
        <InputField
          field="administeredBy"
          label="Administered By"
          placeholder="Healthcare provider name"
          icon={Syringe}
        />
        <div className="grid grid-cols-2 gap-4">
          <SelectField
            field="site"
            label="Injection Site"
            options={["Left arm","Right arm","Left thigh","Right thigh","Left buttock","Right buttock","Oral","Nasal"]}
          />
          <SelectField
            field="route"
            label="Route"
            options={["Intramuscular","Subcutaneous","Intradermal","Oral","Nasal","Intranasal"]}
          />
        </div>
        <SelectField
          field="status"
          label="Status"
          options={["Pending","Completed","Overdue"]}
        />
        <TextAreaField
          field="adverseReaction"
          label="Adverse Reactions"
          placeholder="Any adverse reactions or side effects..."
          icon={AlertCircle}
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
            onClick={handleAddImmunization}
            disabled={loading}
          >
            Add Immunization
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </div>
      {/* Immunization History (right side) can be rendered by parent or here if needed */}
    </div>
  );
}

export default ImmunizationRecords;
