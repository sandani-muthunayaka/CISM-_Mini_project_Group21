// Example: How to use the Layout Components

import React from 'react';
import StaffLayout from '../components/StaffLayout';
import AdminLayout from '../components/AdminLayout';

// Example Staff Page
const ExampleStaffPage = () => {
  return (
    <StaffLayout title="Your Page Title">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Your Page Content</h1>
        <p className="text-gray-600">Your page content goes here...</p>
        {/* Remove all hardcoded sidebar code and just put your content here */}
      </div>
    </StaffLayout>
  );
};

// Example Admin Page
const ExampleAdminPage = () => {
  return (
    <AdminLayout title="Admin Page Title">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Your Admin Content</h1>
        <p className="text-gray-600">Your admin page content goes here...</p>
        {/* Remove all hardcoded sidebar code and just put your content here */}
      </div>
    </AdminLayout>
  );
};

export { ExampleStaffPage, ExampleAdminPage };