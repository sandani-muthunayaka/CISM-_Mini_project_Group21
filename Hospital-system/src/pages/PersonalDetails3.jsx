import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Activity, Cigarette, Coffee, Wine } from "lucide-react";
import SideBar2 from "../functions/SideBar2";
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';
import { apiPost } from '../utils/api';

const PersonalDetails3 = () => {
  const Navigate = useNavigate();
  const location = useLocation();
  const [patientId, setPatientId] = useState(null);
  
  const [formData, setFormData] = useState({
    physicalActivity: '',
    tobaccoSmoking: '',
    betelChewing: '',
    otherTobacco: '',
    alcoholConsumption: '',
    otherSubstance: '',
    unhealthySnacks: ''
  });

  const [familyHistory, setFamilyHistory] = useState({
    ischaemicHeartDiseases: false,
    highBloodPressure: false,
    stroke: false,
    diabetesMellitus: false,
    cancer: false,
    copdAndAsthma: false,
    kidneyDiseases: false,
    other: false,
    suddenDeaths: false
  });

  // Get patient ID from URL params or localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const idFromUrl = urlParams.get('patientId');
    const idFromStorage = localStorage.getItem('currentPatientId');
    
    if (idFromUrl) {
      setPatientId(idFromUrl);
      localStorage.setItem('currentPatientId', idFromUrl);
    } else if (idFromStorage) {
      setPatientId(idFromStorage);
    } else {
      // Generate a new patient ID if none exists
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 9);
      const newPatientId = `PAT${timestamp}${random}`.toUpperCase();
      setPatientId(newPatientId);
      localStorage.setItem('currentPatientId', newPatientId);
    }

    // Load existing data if available
    loadExistingData();
  }, [location]);

  const loadExistingData = async () => {
    if (!patientId) return;
    
    try {
      // Try to load from backend first
      const response = await axios.get(`http://localhost:3000/patient/${patientId}`);
      if (response.data && response.data.tab3) {
        const existingData = response.data.tab3;
        setFormData(prev => ({
          ...prev,
          ...existingData.lifestyleData
        }));
        
        if (existingData.familyHistory) {
          setFamilyHistory(existingData.familyHistory);
        }
        console.log('Data loaded from backend');
        return;
      }
    } catch (error) {
      console.log('Backend not available or no existing data found, checking localStorage...');
    }
    
    // Fallback to localStorage
    try {
      const localStorageKey = `patient_${patientId}_tab3`;
      const savedData = localStorage.getItem(localStorageKey);
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        
        if (parsedData.lifestyleData) {
          setFormData(prev => ({
            ...prev,
            ...parsedData.lifestyleData
          }));
        }
        
        if (parsedData.familyHistory) {
          setFamilyHistory(parsedData.familyHistory);
        }
        
        console.log('Data loaded from localStorage');
      }
    } catch (localStorageError) {
      console.log('No data found in localStorage:', localStorageError);
    }
  };

  const handleCheckboxChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    console.log(`Updated ${field} to:`, value);
  };

  const handleFamilyHistoryChange = (disease) => {
    setFamilyHistory(prev => ({
      ...prev,
      [disease]: !prev[disease]
    }));
    console.log(`Updated ${disease} to:`, !familyHistory[disease]);
  };

  const handleNext = async () => {
    if (!patientId) {
      alert('Patient ID is missing. Please go back to the previous page.');
      return;
    }

    // Basic validation - check if at least some lifestyle data is filled
    const hasLifestyleData = Object.values(formData).some(value => value !== '');
    const hasFamilyHistory = Object.values(familyHistory).some(value => value === true);
    
    if (!hasLifestyleData && !hasFamilyHistory) {
      alert('Please fill in at least some lifestyle information or family history before proceeding.');
      return;
    }

    try {
      // Prepare data for saving in new backend format
      const tabsToSave = {
        tab3: {
          lifestyleData: formData,
          familyHistory: familyHistory,
          timestamp: new Date().toISOString()
        }
      };
      const dataToSave = {
        patientId,
        tabs: tabsToSave
      };
      console.log('Saving PersonalDetails3 data:', dataToSave);
      await apiPost('/patient/save', dataToSave);
      console.log('PersonalDetails3 data saved successfully for patient:', patientId);
      // Also save to localStorage as backup
      const localStorageKey = `patient_${patientId}_tab3`;
      localStorage.setItem(localStorageKey, JSON.stringify(tabsToSave.tab3));
      // Navigate to next page with patient ID
      Navigate(`/personalDetails5?patientId=${patientId}`);
    } catch (error) {
      console.error('Error saving data to backend:', error);
      // If backend fails, save to localStorage only
      try {
        const localStorageKey = `patient_${patientId}_tab3`;
        const dataToSave = {
          lifestyleData: formData,
          familyHistory: familyHistory,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem(localStorageKey, JSON.stringify(dataToSave));
        console.log('Data saved to localStorage as backup');
        alert('Data saved locally. Backend connection failed. You can continue to the next page.');
        // Navigate to next page even if backend failed
        Navigate(`/personalDetails5?patientId=${patientId}`);
      } catch (localStorageError) {
        console.error('Error saving to localStorage:', localStorageError);
        alert('Error saving data. Please try again.');
      }
    }
  };

  const clearForm = () => {
    setFormData({
      physicalActivity: '',
      tobaccoSmoking: '',
      betelChewing: '',
      otherTobacco: '',
      alcoholConsumption: '',
      otherSubstance: '',
      unhealthySnacks: ''
    });
    
    setFamilyHistory({
      ischaemicHeartDiseases: false,
      highBloodPressure: false,
      stroke: false,
      diabetesMellitus: false,
      cancer: false,
      copdAndAsthma: false,
      kidneyDiseases: false,
      other: false,
      suddenDeaths: false
    });
    
    alert('Form cleared successfully!');
  };

  const handleBack = () => {
    Navigate('/personalDetails');
  };

  const tabs = [
    "Personal Details",
    "OPD Records", 
    "Hospitalization",
    "Current Medication",
    "Lifestyles",
    "Immunization",
    "Surgical History"
  ];

  const CheckboxGroup = ({ field, options, icon: Icon, label }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-5 h-5 text-blue-600" />
        <label className="text-sm font-medium text-gray-700">{label}:</label>
      </div>
      <div className="space-y-2 ml-7">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name={field}
              value={option.value}
              checked={formData[field] === option.value}
              onChange={(e) => handleCheckboxChange(field, e.target.value)}
              className="w-4 h-4 text-blue-600 border-2 border-gray-300 focus:ring-blue-500 focus:ring-2 transition-all"
            />
            <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <SideBar2>
      <div className="bg-white w-full min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="px-8 py-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 text-center">
                Risk Behavioral History
              </h2>
                          <p className="text-gray-600 text-center mt-2">
              Please provide information about lifestyle and behavioral factors
            </p>
            </div>

            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-8">
                  <CheckboxGroup
                    field="physicalActivity"
                    label="Physical Activity"
                    icon={Activity}
                    options={[
                      { value: 'active', label: 'Active (Regular exercise/physical activity)' },
                      { value: 'non-active', label: 'Non-active (Sedentary lifestyle)' }
                    ]}
                  />

                  <CheckboxGroup
                    field="tobaccoSmoking"
                    label="Tobacco Smoking"
                    icon={Cigarette}
                    options={[
                      { value: 'active', label: 'Active smoker' },
                      { value: 'non-active', label: 'Non-smoker' }
                    ]}
                  />

                  <CheckboxGroup
                    field="betelChewing"
                    label="Betel Chewing"
                    icon={Coffee}
                    options={[
                      { value: 'user', label: 'Regular user' },
                      { value: 'non-user', label: 'Non-user' }
                    ]}
                  />

                  <CheckboxGroup
                    field="otherTobacco"
                    label="Other Tobacco/Arecanut Preparations"
                    icon={Coffee}
                    options={[
                      { value: 'user', label: 'Regular user' },
                      { value: 'non-user', label: 'Non-user' }
                    ]}
                  />
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  <CheckboxGroup
                    field="alcoholConsumption"
                    label="Alcohol Consumption"
                    icon={Wine}
                    options={[
                      { value: 'user', label: 'Regular consumer' },
                      { value: 'non-user', label: 'Non-consumer' }
                    ]}
                  />

                  <CheckboxGroup
                    field="otherSubstance"
                    label="Other Substance Use"
                    icon={Coffee}
                    options={[
                      { value: 'user', label: 'Regular user' },
                      { value: 'non-user', label: 'Non-user' }
                    ]}
                  />

                  <CheckboxGroup
                    field="unhealthySnacks"
                    label="Unhealthy Snacks Intake"
                    icon={Coffee}
                    options={[
                      { value: 'non-consumer', label: 'Non-consumer' },
                      { value: 'low', label: '≤ 5 times per week' },
                      { value: 'high', label: '> 5 times per week' }
                    ]}
                  />
                </div>
              </div>

              {/* Family History of Diseases Section */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-xl text-gray-500 font-semibold mb-4 ml-1.5">
                  Diseases that family members are suffering
                </h3>
                <div className="flex flex-col ml-2 space-y-3">
                  {[
                    { key: 'ischaemicHeartDiseases', label: 'Ischaemic heart diseases' },
                    { key: 'highBloodPressure', label: 'High blood pressure' },
                    { key: 'stroke', label: 'Stroke' },
                    { key: 'diabetesMellitus', label: 'Diabetes Mellitus' },
                    { key: 'cancer', label: 'Cancer' },
                    { key: 'copdAndAsthma', label: 'COPD and Asthma' },
                    { key: 'kidneyDiseases', label: 'Kidney Diseases' },
                    { key: 'other', label: 'Other' },
                    { key: 'suddenDeaths', label: 'Sudden deaths of relatives due to unknown causes' }
                  ].map((disease) => (
                    <div key={disease.key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={familyHistory[disease.key]}
                        onChange={() => handleFamilyHistoryChange(disease.key)}
                        className="w-4 h-4 text-gray-600 border border-gray-500 focus:ring-gray-500"
                      />
                      <span className="text-sm text-gray-500">{disease.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-center gap-4 mt-12 pt-8 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 px-8 py-3 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={clearForm}
                  className="flex items-center gap-2 px-8 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Clear Form
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!patientId}
                  className={`flex items-center gap-2 px-8 py-3 font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${
                    patientId 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SideBar2>
  );
};

export default PersonalDetails3;
