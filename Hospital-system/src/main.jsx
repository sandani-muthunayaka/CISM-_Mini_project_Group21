import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import './index.css';

// Route Guards
import { ProtectedRoute, AdminRoute, GuestRoute, MedicalStaffRoute } from './utils/RouteGuards';

// Authentication Pages
import LoginScreen from './pages/LoginScreen';
import RegisterScreen from './pages/RegisterScreen';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import ForgotPassword from './pages/ForgotPassword';
import ChangePassword from './pages/ChangePassword';

// Main Pages
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboardNew';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Admin Pages
import AdminPasswordRequests from './pages/AdminPasswordRequests';
import AcceptedRejectedPasswordRequests from './pages/AcceptedRejectedPasswordRequests';
import PersonalDetails from './pages/PersonalDetails';

import PersonalDetails3 from './pages/PersonalDetails3';

import PersonalDetails5 from './pages/PersonalDetails5';

import RefferedTo from './pages/RefferedTo';
import AddSurgicalRecords from './pages/AddSurgicalRecords';
import PsychologicalRecords from './pages/PsychologicalRecords';
import ImmunizationRecords from './pages/ImmunizationRecords';
import PastSurgicalHistory from './pages/PastSurgicalHistory';
import PastPsychologicalHistory from './pages/PastPsychologicalHistory';
import PastImmunizationHistory from './pages/PastImmunizationHistory';
import GynHistoryPage from './pages/GynHistoryPage';
import OccupationalHistory from './pages/OccupationalHistory';
import SuccessfulRegistration from './pages/SuccessfulRegistration';
import PatientRecords from './pages/PatientRecords';
import PatientDetail from './pages/PatientDetail';
import PatientOPDRecords from './pages/PatientOPDRecords';
import PatientHospitalization from './pages/PatientHospitalization';
import PatientMedication from './pages/PatientMedication';
import PatientLifestyles from './pages/PatientLifestyles';
import PatientBasicInfo from './pages/PatientBasicInfo';
import AdminStaffVerification from './pages/AdminStaffVerification';
import Notifications from './pages/Notifications';
import ImmunizationPage from './pages/ImmunizationPage';
import PendingStaffRequests from './pages/PendingStaffRequests';
import RequestLostBook from './pages/RequestLostBook';
import Reports from './pages/Reports';
import PatientReport from './pages/PatientReport';
import StaffReport from './pages/StaffReport';
import BookReport from './pages/BookReport';

import SideBar from './functions/SideBar';
import NavBar from './functions/NavBar';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        {/* Public Authentication Routes - Only accessible when not logged in */}
        <Route path="/" element={<GuestRoute><LoginScreen/></GuestRoute>} />
        <Route path="/loginScreen" element={<GuestRoute><LoginScreen /></GuestRoute>} />
        <Route path="/registerScreen" element={<GuestRoute><RegisterScreen /></GuestRoute>} />
        <Route path="/admin-login" element={<GuestRoute><AdminLogin /></GuestRoute>} />
        <Route path="/admin-register" element={<GuestRoute><AdminRegister /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
        <Route path="/change-password" element={<ChangePassword />} />
        
        {/* Protected Staff Dashboard Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        {/* Admin Only Routes */}
        <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/AdminPasswordRequests" element={<AdminRoute><AdminPasswordRequests /></AdminRoute>} />
        <Route path="/AcceptedRejectedPasswordRequests" element={<AdminRoute><AcceptedRejectedPasswordRequests /></AdminRoute>} />
        <Route path="/AdminStaffVerification" element={<AdminRoute><AdminStaffVerification /></AdminRoute>} />
        <Route path="/PendingStaffRequests" element={<AdminRoute><PendingStaffRequests /></AdminRoute>} />
        
        {/* Medical Staff Only Routes - Patient Registration (Doctors & Nurses) */}
        <Route path="/personalDetails" element={<MedicalStaffRoute><PersonalDetails /></MedicalStaffRoute>} />
        <Route path="/personalDetails3" element={<MedicalStaffRoute><PersonalDetails3 /></MedicalStaffRoute>} />
        <Route path="/personalDetails5" element={<MedicalStaffRoute><PersonalDetails5 /></MedicalStaffRoute>} />
        <Route path="/AddSurgicalRecords" element={<MedicalStaffRoute><AddSurgicalRecords /></MedicalStaffRoute>} />
        <Route path="/psychologicalRecords" element={<MedicalStaffRoute><PsychologicalRecords /></MedicalStaffRoute>} />
        <Route path="/immunizationRecords" element={<MedicalStaffRoute><ImmunizationRecords /></MedicalStaffRoute>} />
        <Route path="/PastSurgicalHistory" element={<MedicalStaffRoute><PastSurgicalHistory /></MedicalStaffRoute>} />
        <Route path="/PastPsychologicalHistory" element={<MedicalStaffRoute><PastPsychologicalHistory /></MedicalStaffRoute>} />
        <Route path="/PastImmunizationHistory" element={<MedicalStaffRoute><PastImmunizationHistory /></MedicalStaffRoute>} />
        <Route path="/GynHistoryPage" element={<MedicalStaffRoute><GynHistoryPage /></MedicalStaffRoute>} />
        <Route path="/OccupationalHistory" element={<MedicalStaffRoute><OccupationalHistory /></MedicalStaffRoute>} />
        <Route path="/SuccessfulRegistration" element={<MedicalStaffRoute><SuccessfulRegistration /></MedicalStaffRoute>} />
        
        {/* Protected Patient Records Routes */}
        <Route path="/PatientRecords" element={<ProtectedRoute><PatientRecords /></ProtectedRoute>} />
        <Route path="/patient/:patientId" element={<ProtectedRoute><PatientDetail /></ProtectedRoute>} />
        <Route path="/patient/:patientId/personal" element={<ProtectedRoute><PatientDetail /></ProtectedRoute>} />
        <Route path="/patient/:patientId/opd" element={<ProtectedRoute><PatientOPDRecords /></ProtectedRoute>} />
        <Route path="/patient/:patientId/hospitalization" element={<ProtectedRoute><PatientHospitalization /></ProtectedRoute>} />
        <Route path="/patient/:patientId/medication" element={<ProtectedRoute><PatientMedication /></ProtectedRoute>} />
        <Route path="/patient/:patientId/lifestyles" element={<ProtectedRoute><PatientLifestyles /></ProtectedRoute>} />
        <Route path="/patient/:patientId/surgical" element={<ProtectedRoute><AddSurgicalRecords /></ProtectedRoute>} />
        <Route path="/patient/:patientId/gyn" element={<ProtectedRoute><GynHistoryPage /></ProtectedRoute>} />
        <Route path="/patient/:patientId/occupational" element={<ProtectedRoute><OccupationalHistory /></ProtectedRoute>} />
        <Route path="/patient/:patientId/psychological" element={<ProtectedRoute><PastPsychologicalHistory /></ProtectedRoute>} />
        <Route path="/patient/:patientId/immunizationpage" element={<ProtectedRoute><ImmunizationPage /></ProtectedRoute>} /> 
        <Route path="/patient/:patientId/referral" element={<ProtectedRoute><RefferedTo /></ProtectedRoute>} /> 
        <Route path="/PatientBasicInfo" element={<ProtectedRoute><PatientBasicInfo /></ProtectedRoute>} />
        
        {/* Admin Only Report Routes */}
        <Route path="/Reports" element={<AdminRoute><Reports /></AdminRoute>} />
        <Route path="/PatientReport" element={<AdminRoute><PatientReport /></AdminRoute>} />
        <Route path="/StaffReport" element={<AdminRoute><StaffReport /></AdminRoute>} />
        <Route path="/BookReport" element={<AdminRoute><BookReport /></AdminRoute>} />
        
        {/* Protected General Routes */}
        <Route path="/Notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/RequestLostBook" element={<ProtectedRoute><RequestLostBook /></ProtectedRoute>} />
        
        {/* Component Routes */}
        <Route path="/sideBar" element={<ProtectedRoute><SideBar /></ProtectedRoute>} />
        <Route path="/NavBar" element={<ProtectedRoute><NavBar /></ProtectedRoute>} />
        
        {/* Unauthorized Access Page */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Routes>
    </Router>
  </StrictMode>,
)
