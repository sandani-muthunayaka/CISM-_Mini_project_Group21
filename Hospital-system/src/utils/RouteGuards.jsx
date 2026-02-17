import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from './useAuth';

// Loading component
const AuthLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Checking authentication...</p>
    </div>
  </div>
);

// Protected Route Component - Requires login
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  console.log('🛡️ ProtectedRoute check:', { 
    isAuthenticated, 
    loading, 
    path: location.pathname,
    localStorage: {
      isLoggedIn: localStorage.getItem('isLoggedIn'),
      hasUser: !!localStorage.getItem('user'),
      hasToken: !!localStorage.getItem('authToken')
    }
  });

  if (loading) {
    return <AuthLoader />;
  }

  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to login');
    // Redirect to login with the current location
    return <Navigate to="/loginScreen" state={{ from: location }} replace />;
  }

  console.log('✅ Authenticated, rendering protected content');
  return children;
};

// Admin Only Route Component - Requires admin privileges
export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AuthLoader />;
  }

  if (!isAuthenticated) {
    // Redirect to admin login
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    // Redirect non-admin users to regular dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Guest Route Component - Only for non-authenticated users (login/register pages)
export const GuestRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <AuthLoader />;
  }

  if (isAuthenticated) {
    // Redirect authenticated users to appropriate dashboard
    return <Navigate to={isAdmin ? "/admin-dashboard" : "/dashboard"} replace />;
  }

  return children;
};

// Medical Staff Route Component - Only for Doctors and Nurses
export const MedicalStaffRoute = ({ children }) => {
  const { isAuthenticated, isMedicalStaff, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AuthLoader />;
  }

  if (!isAuthenticated) {
    // Redirect to login
    return <Navigate to="/loginScreen" state={{ from: location }} replace />;
  }

  if (!isMedicalStaff) {
    // Redirect non-medical staff to dashboard with error message
    alert('Access Denied: Only Doctors and Nurses can register patients.');
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route Component - Accessible to everyone
export const PublicRoute = ({ children }) => {
  return children;
};