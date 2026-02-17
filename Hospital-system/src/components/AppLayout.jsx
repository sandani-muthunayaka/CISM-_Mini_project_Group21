import React from 'react';
import StaffLayout from './StaffLayout';
import AdminLayout from './AdminLayout';
import useAuth from '../utils/useAuth';

const AppLayout = ({ children, title }) => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    // Show loading spinner while checking auth
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Return appropriate layout based on user role
  if (isAdmin) {
    return (
      <AdminLayout title={title}>
        {children}
      </AdminLayout>
    );
  }

  return (
    <StaffLayout title={title}>
      {children}
    </StaffLayout>
  );
};

export default AppLayout;