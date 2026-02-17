import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from 'axios';
import { apiPost } from '../utils/api';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import SideBar2 from "../functions/SideBar2";
import { User, Phone, MapPin, Heart, Calendar, IdCard, Hash, Users, GraduationCap } from "lucide-react";
import { generatePatientId } from "../utils/patientIdGenerator";

const TABS = [1, 2, 3, 4, 5, 6];

const PersonalDetails = () => {
  const [tabIndex, setTabIndex] = useState(1);
  const [formData, setFormData] = useState({
    1: {
      name: '',
      nic: '',
      age: '',
      dateOfBirth: null,
      gender: '',
      emergencyContactName: '',
      emergencyContactRelationship: '',
      emergencyContactPhone: '',
      emergencyContactGender: '',
      address: '',
      district: '',
      mohArea: '',
      phmArea: '',
      phiArea: '',
      maritalStatus: '',
      educationLevel: ''
    },
    2: {},
    3: {},
    4: {},
    5: {},
    6: {},
  });
  const [patientId, setPatientId] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Generate unique patient ID when component mounts
  useEffect(() => {
    // Patient ID will be generated when form is submitted with NIC and DOB
    setPatientId(null);
  }, []);

  const Navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);

  // Validation functions
  const validateName = (name) => {
    if (!name || name.trim() === '') {
      return 'Name is required';
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      return 'Name should contain only letters and spaces';
    }
    if (name.trim().length < 2) {
      return 'Name should be at least 2 characters';
    }
    return '';
  };

  const validateNIC = (nic) => {
    if (!nic || nic.trim() === '') {
      return 'NIC is required';
    }
    // Check for 12 digits or 9 digits followed by v/V or x/X
    const nic12Pattern = /^\d{12}$/;
    const nic9Pattern = /^\d{9}[vVxX]$/;
    
    if (!nic12Pattern.test(nic) && !nic9Pattern.test(nic)) {
      return 'NIC must be 12 digits or 9 digits followed by V/X';
    }
    return '';
  };

  const validateAge = (age) => {
    if (!age || age === '') {
      return 'Age is required';
    }
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum <= 0) {
      return 'Age must be a positive number';
    }
    if (ageNum > 150) {
      return 'Please enter a valid age';
    }
    return '';
  };

  const validateGender = (gender) => {
    if (!gender || gender === '') {
      return 'Gender is required';
    }
    return '';
  };

  const validateDateOfBirth = (date) => {
    if (!date) {
      return 'Date of birth is required';
    }
    const today = new Date();
    if (date > today) {
      return 'Date of birth cannot be in the future';
    }
    return '';
  };

  const validatePhone = (phone) => {
    // Phone is optional, only validate if provided
    if (phone && phone.trim() !== '') {
      if (!/^\d{10}$/.test(phone)) {
        return 'Phone number must be exactly 10 digits';
      }
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [tabIndex]: { ...formData[tabIndex], [name]: value }
    });

    // Validate the field
    let error = '';
    switch (name) {
      case 'name':
        error = validateName(value);
        break;
      case 'nic':
        error = validateNIC(value);
        break;
      case 'age':
        error = validateAge(value);
        break;
      case 'gender':
        error = validateGender(value);
        break;
      case 'emergencyContactPhone':
        error = validatePhone(value);
        break;
      default:
        break;
    }

    // Update validation errors
    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
    
    // If age is manually changed, validate against date of birth
    if (name === 'age' && selectedDate) {
      const today = new Date();
      const birthDate = new Date(selectedDate);
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      
      // If the manually entered age differs significantly from calculated age, show a warning
      if (Math.abs(parseInt(value) - calculatedAge) > 1) {
        console.warn(`Age mismatch: Entered age (${value}) differs from calculated age (${calculatedAge}) based on date of birth`);
      }
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setFormData({
      ...formData,
      [tabIndex]: { ...formData[tabIndex], dateOfBirth: date }
    });

    // Validate date of birth
    const error = validateDateOfBirth(date);
    setValidationErrors(prev => ({
      ...prev,
      dateOfBirth: error
    }));
    
    // Also update age if date is selected
    if (date) {
      const today = new Date();
      const birthDate = new Date(date);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      setFormData(prev => ({
        ...prev,
        [tabIndex]: { ...prev[tabIndex], age: age.toString() }
      }));
    }
  };

  const handleRadioChange = (name, value) => {
    setFormData({
      ...formData,
      [tabIndex]: { ...formData[tabIndex], [name]: value }
    });
  };

  const regeneratePatientId = () => {
    if (formData[tabIndex].nic && selectedDate) {
      const uniqueId = generatePatientId(formData[tabIndex].nic, selectedDate);
      setPatientId(uniqueId);
      console.log('Regenerated Patient ID:', uniqueId);
    } else {
      alert('Please fill in NIC and Date of Birth first to generate Patient ID');
    }
  };

  const clearForm = () => {
    setFormData({
      1: {
        name: '',
        nic: '',
        age: '',
        dateOfBirth: null,
        gender: '',
        emergencyContactName: '',
        emergencyContactRelationship: '',
        emergencyContactPhone: '',
        emergencyContactGender: '',
        address: '',
        district: '',
        mohArea: '',
        phmArea: '',
        phiArea: '',
        maritalStatus: '',
        educationLevel: ''
      },
      2: {},
      3: {},
      4: {},
      5: {},
      6: {},
    });
    setSelectedDate(null);
    setValidationErrors({});
    alert('Form cleared successfully!');
  };

  const handleNext = async () => {
    // Validate all required fields
    const errors = {};
    errors.name = validateName(formData[tabIndex].name);
    errors.nic = validateNIC(formData[tabIndex].nic);
    errors.age = validateAge(formData[tabIndex].age);
    errors.gender = validateGender(formData[tabIndex].gender);
    errors.dateOfBirth = validateDateOfBirth(selectedDate);
    // Only validate phone if provided
    if (formData[tabIndex].emergencyContactPhone) {
      errors.emergencyContactPhone = validatePhone(formData[tabIndex].emergencyContactPhone);
    }

    // Filter out empty errors
    const hasErrors = Object.values(errors).some(error => error !== '');
    
    if (hasErrors) {
      setValidationErrors(errors);
      alert('Please fix all validation errors before proceeding');
      return;
    }

    // Basic validation - check if required fields are filled
    const requiredFields = ['name', 'nic', 'age', 'gender'];
    const missingFields = requiredFields.filter(field => !formData[tabIndex][field]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Generate patient ID based on NIC and date of birth
    const generatedPatientId = generatePatientId(formData[tabIndex].nic, selectedDate);
    setPatientId(generatedPatientId);

    // Check if patientId already exists before saving
    try {
      const checkRes = await axios.get(`http://localhost:3000/patient/${generatedPatientId}`);
      if (checkRes.data && checkRes.data.tab1 && Object.keys(checkRes.data.tab1).length > 0) {
        alert('This patient is already registered. Please check the patient ID or NIC.');
        return;
      } else {
        // Only continue if not duplicate
      }
    } catch (checkErr) {
      // If not found, continue
    }

    try {
      // Prepare data for saving in new backend format
      const tabsToSave = {
        tab1: {
          ...formData[tabIndex],
          dateOfBirth: selectedDate ? selectedDate.toISOString() : null
        }
      };
      const dataToSave = {
        patientId: generatedPatientId,
        tabs: tabsToSave
      };
      console.log('Saving data:', dataToSave);
      // Save current tab data
      const saveRes = await apiPost('/patient/save', dataToSave);
      console.log('Data saved successfully for patient:', generatedPatientId);
      // Navigate to next page with patient ID
      Navigate(`/personalDetails3?patientId=${generatedPatientId}`);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.duplicateNic) {
        alert('This NIC is already registered. Please check the NIC number.');
        return;
      }
      console.error('Error saving data:', error);
      alert('Error saving data. Please try again.');
    }
  };

  return (
    <SideBar2>
      <div className="bg-white w-full min-h-screen">
        <div className="p-6">
          <h2 className="text-2xl text-gray-700 font-bold text-center mb-8 flex items-center justify-center gap-2">
            <User className="w-6 h-6 text-blue-600" />
            Register Patients
          </h2>
          
          <div className="max-w-7xl mx-auto">
            <form className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left Column: Basic Info + Emergency Contact */}
                <div className="space-y-8">
                  {/* Basic Information Section */}
                  <div className="bg-white p-6 rounded-lg border border-blue-200">
                    <h3 className="text-xl text-gray-700 font-semibold mb-6 border-b border-blue-300 pb-2 flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      Basic Information
                    </h3>
                    <div className="space-y-4">
                      {/* Name */}
                      <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                          <User className="w-4 h-4 text-blue-600" /> Name:
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData[tabIndex].name || ''}
                          onChange={handleChange}
                          placeholder="Enter full name"
                          className={`w-full p-3 text-gray-700 rounded-lg border ${validationErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'} outline-none focus:ring-2 transition-all`}
                        />
                        {validationErrors.name && (
                          <span className="text-red-500 text-sm">{validationErrors.name}</span>
                        )}
                      </div>
                      {/* NIC */}
                      <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                          <IdCard className="w-4 h-4 text-blue-600" /> NIC:
                        </label>
                        <input
                          type="text"
                          name="nic"
                          value={formData[tabIndex].nic || ''}
                          onChange={handleChange}
                          placeholder="NIC no."
                          className={`w-full p-3 text-gray-700 rounded-lg border ${validationErrors.nic ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'} outline-none focus:ring-2 transition-all`}
                        />
                        {validationErrors.nic && (
                          <span className="text-red-500 text-sm">{validationErrors.nic}</span>
                        )}
                      </div>
                      {/* Age */}
                      <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                          <Hash className="w-4 h-4 text-blue-600" /> Age:
                        </label>
                        <input
                          type="number"
                          name="age"
                          value={formData[tabIndex].age || ''}
                          onChange={handleChange}
                          placeholder="Enter age"
                          className={`w-full p-3 text-gray-700 rounded-lg border ${validationErrors.age ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'} outline-none focus:ring-2 transition-all`}
                        />
                        {validationErrors.age && (
                          <span className="text-red-500 text-sm">{validationErrors.age}</span>
                        )}
                      </div>
                      {/* DOB */}
                      <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-blue-600" /> Date of Birth:
                        </label>
                        <div className="relative">
                          <DatePicker
                            selected={selectedDate}
                            onChange={handleDateChange}
                            dateFormat="yyyy-MM-dd"
                            showYearDropdown
                            scrollableYearDropdown
                            yearDropdownItemNumber={50}
                            showMonthDropdown
                            className={`w-full p-3 pl-10 text-gray-700 rounded-lg border ${validationErrors.dateOfBirth ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'} outline-none focus:ring-2 transition-all`}
                            placeholderText="Select Date"
                          />
                          <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                        {validationErrors.dateOfBirth && (
                          <span className="text-red-500 text-sm">{validationErrors.dateOfBirth}</span>
                        )}
                      </div>
                      {/* Gender */}
                      <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                          <Users className="w-4 h-4 text-blue-600" /> Gender:
                        </label>
                        <select 
                          name="gender"
                          value={formData[tabIndex].gender || ''}
                          onChange={handleChange}
                          className={`w-full p-3 text-gray-700 rounded-lg border ${validationErrors.gender ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'} outline-none focus:ring-2 transition-all`}
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                        {validationErrors.gender && (
                          <span className="text-red-500 text-sm">{validationErrors.gender}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Emergency Contact Information */}
                  <div className="bg-white p-6 rounded-lg border border-blue-200">
                    <h3 className="text-xl text-gray-700 font-semibold mb-6 border-b border-blue-300 pb-2 flex items-center gap-2">
                      <Phone className="w-5 h-5 text-blue-600" />
                      Emergency Contact Information
                    </h3>
                    <div className="space-y-4">
                      {/* Emergency Contact Name */}
                      <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                          <User className="w-4 h-4 text-blue-600" /> Name:
                        </label>
                        <input
                          type="text"
                          name="emergencyContactName"
                          value={formData[tabIndex].emergencyContactName || ''}
                          onChange={handleChange}
                          placeholder="Emergency contact name"
                          className="w-full p-3 text-gray-700 rounded-lg border border-gray-300 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                        />
                      </div>
                      {/* Relationship */}
                      <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                          <Users className="w-4 h-4 text-blue-600" /> Relationship:
                        </label>
                        <input
                          type="text"
                          name="emergencyContactRelationship"
                          value={formData[tabIndex].emergencyContactRelationship || ''}
                          onChange={handleChange}
                          placeholder="Relationship"
                          className="w-full p-3 text-gray-700 rounded-lg border border-gray-300 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                        />
                      </div>
                      {/* Phone Number */}
                      <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                          <Phone className="w-4 h-4 text-blue-600" /> Phone Number: <span className="text-gray-400 text-xs">(Optional)</span>
                        </label>
                        <input
                          type="tel"
                          name="emergencyContactPhone"
                          value={formData[tabIndex].emergencyContactPhone || ''}
                          onChange={handleChange}
                          placeholder="Telephone number (10 digits)"
                          maxLength="10"
                          className={`w-full p-3 text-gray-700 rounded-lg border ${validationErrors.emergencyContactPhone ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'} outline-none focus:ring-2 transition-all`}
                        />
                        {validationErrors.emergencyContactPhone && (
                          <span className="text-red-500 text-sm">{validationErrors.emergencyContactPhone}</span>
                        )}
                      </div>
                      {/* Emergency Contact Gender */}
                      <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                          <Users className="w-4 h-4 text-blue-600" /> Gender:
                        </label>
                        <select 
                          name="emergencyContactGender"
                          value={formData[tabIndex].emergencyContactGender || ''}
                          onChange={handleChange}
                          className="w-full p-3 text-gray-700 rounded-lg border border-gray-300 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Right Column: Contact Details + At Registration */}
                <div className="space-y-8">
                  {/* Contact Details Section */}
                  <div className="bg-white p-6 rounded-lg border border-blue-200">
                    <h3 className="text-xl text-gray-700 font-semibold mb-6 border-b border-blue-300 pb-2 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      Contact Details
                    </h3>
                    <div className="space-y-4">
                      {/* Address */}
                      <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-blue-600" /> Address:
                        </label>
                        <textarea
                          name="address"
                          value={formData[tabIndex].address || ''}
                          onChange={handleChange}
                          placeholder="Enter address"
                          rows="3"
                          className="w-full p-3 text-gray-700 rounded-lg border border-gray-300 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none"
                        />
                      </div>
                      {/* District */}
                      <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-blue-600" /> District:
                        </label>
                        <select 
                          name="district"
                          value={formData[tabIndex].district || ''}
                          onChange={handleChange}
                          className="w-full p-3 text-gray-700 rounded-lg border border-gray-300 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                        >
                          <option value="">Select District</option>
                          <option value="colombo">Colombo</option>
                          <option value="rathnapura">Rathnapura</option>
                          <option value="kegalle">Kegalle</option>
                          <option value="kaluthara">Kaluthara</option>
                          <option value="kurunegala">Kurunegala</option>
                          <option value="galle">Galle</option>
                          <option value="mathara">Mathara</option>
                          <option value="jaffna">Jaffna</option>
                          <option value="vavniya">Vavniya</option>
                          <option value="nuwaraeliya">Nuwaraeliya</option>
                        </select>
                      </div>
                      {/* MOH area */}
                      <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-blue-600" /> MOH Area:
                        </label>
                        <select 
                          name="mohArea"
                          value={formData[tabIndex].mohArea || ''}
                          onChange={handleChange}
                          className="w-full p-3 text-gray-700 rounded-lg border border-gray-300 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                        >
                          <option value="">Select MOH Area</option>
                          <option value="dehiowita">Dehiowita</option>
                          <option value="rathnapura">Rathnapura</option>
                          <option value="kegalle">Kegalle</option>
                          <option value="kaluthara">Kaluthara</option>
                          <option value="kurunegala">Kurunegala</option>
                          <option value="galle">Galle</option>
                          <option value="mathara">Mathara</option>
                          <option value="jaffna">Jaffna</option>
                          <option value="vavniya">Vavniya</option>
                          <option value="nuwaraeliya">Nuwaraeliya</option>
                        </select>
                      </div>
                      {/* PHM area */}
                      <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-blue-600" /> PHM Area:
                        </label>
                        <select 
                          name="phmArea"
                          value={formData[tabIndex].phmArea || ''}
                          onChange={handleChange}
                          className="w-full p-3 text-gray-700 rounded-lg border border-gray-300 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                        >
                          <option value="">Select PHM Area</option>
                          <option value="dehiowita">Dehiowita</option>
                          <option value="rathnapura">Rathnapura</option>
                          <option value="kegalle">Kegalle</option>
                          <option value="kaluthara">Kaluthara</option>
                          <option value="kurunegala">Kurunegala</option>
                          <option value="galle">Galle</option>
                          <option value="mathara">Mathara</option>
                          <option value="jaffna">Jaffna</option>
                          <option value="vavniya">Vavniya</option>
                          <option value="nuwaraeliya">Nuwaraeliya</option>
                        </select>
                      </div>
                      {/* PHI area */}
                      <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-blue-600" /> PHI Area:
                        </label>
                        <select 
                          name="phiArea"
                          value={formData[tabIndex].phiArea || ''}
                          onChange={handleChange}
                          className="w-full p-3 text-gray-700 rounded-lg border border-gray-300 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                        >
                          <option value="">Select PHI Area</option>
                          <option value="dehiowita">Dehiowita</option>
                          <option value="rathnapura">Rathnapura</option>
                          <option value="kegalle">Kegalle</option>
                          <option value="kaluthara">Kaluthara</option>
                          <option value="kurunegala">Kurunegala</option>
                          <option value="galle">Galle</option>
                          <option value="mathara">Mathara</option>
                          <option value="jaffna">Jaffna</option>
                          <option value="vavniya">Vavniya</option>
                          <option value="nuwaraeliya">Nuwaraeliya</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  {/* At Registration Section */}
                  <div className="bg-white p-6 rounded-lg border border-blue-200">
                    <h3 className="text-xl text-gray-700 font-semibold mb-6 border-b border-blue-300 pb-2 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-blue-600" />
                      At Registration
                    </h3>
                    <div className="space-y-6">
                      {/* Marital Status */}
                      <div>
                        <h4 className="text-lg font-medium text-gray-600 mb-3 flex items-center gap-1">
                          <Users className="w-4 h-4 text-blue-600" /> Marital Status:
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          {["Married", "Unmarried", "Widowed", "Separated"].map(
                            (status, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-3 p-2 hover:bg-white rounded-lg transition-colors"
                              >
                                <input
                                  type="radio"
                                  name="maritalStatus"
                                  id={`status-${index}`}
                                  value={status.toLowerCase()}
                                  checked={formData[tabIndex].maritalStatus === status.toLowerCase()}
                                  onChange={() => handleRadioChange('maritalStatus', status.toLowerCase())}
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                />
                                <label
                                  htmlFor={`status-${index}`}
                                  className="text-sm font-medium text-gray-700 cursor-pointer"
                                >
                                  {status}
                                </label>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                      {/* Education Level */}
                      <div>
                        <h4 className="text-lg font-medium text-gray-600 mb-3 flex items-center gap-1">
                          <GraduationCap className="w-4 h-4 text-blue-600" /> Highest Education Level:
                        </h4>
                        <div className="space-y-2">
                          {[
                            "No formal education",
                            "Grade 1-5",
                            "Grade 6-11",
                            "O/L",
                            "A/L",
                            "Diploma",
                            "Degree",
                          ].map((level, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-3 p-2 hover:bg-white rounded-lg transition-colors"
                            >
                              <input
                                type="radio"
                                name="educationLevel"
                                id={`education-${index}`}
                                value={level.toLowerCase().replace(/[^a-z0-9]/g, '-')}
                                checked={formData[tabIndex].educationLevel === level.toLowerCase().replace(/[^a-z0-9]/g, '-')}
                                onChange={() => handleRadioChange('educationLevel', level.toLowerCase().replace(/[^a-z0-9]/g, '-'))}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                              />
                              <label
                                htmlFor={`education-${index}`}
                                className="text-sm font-medium text-gray-700 cursor-pointer"
                              >
                                {level}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex justify-center mt-12 space-x-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  className="px-8 py-3 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  onClick={() => Navigate("/dashboard")}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="px-8 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  onClick={clearForm}
                >
                  Clear Form
                </button>
                <button
                  type="button"
                  className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  onClick={handleNext}
                >
                  Next
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </SideBar2>
  );
};

export default PersonalDetails;