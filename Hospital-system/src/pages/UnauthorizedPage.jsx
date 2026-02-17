import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldX, Home, LogIn } from 'lucide-react';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 via-red-200 to-red-300">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldX className="w-10 h-10 text-red-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h1>
          
          <p className="text-gray-600 mb-8">
            You don't have permission to access this page. Please log in with the appropriate credentials.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => navigate('/loginScreen')}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <LogIn className="w-5 h-5" />
              Staff Login
            </button>
            
            <button
              onClick={() => navigate('/admin-login')}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <ShieldX className="w-5 h-5" />
              Admin Login
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Home className="w-5 h-5" />
              Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;