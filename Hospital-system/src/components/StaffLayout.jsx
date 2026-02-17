import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  UserPlus,
  FileText,
  Bell,
  BarChart3,
  Building2,
  Hospital,
  LogOut,
} from 'lucide-react';
import useAuth from '../utils/useAuth';
import useSessionMonitor from '../utils/useSessionMonitor';

const staffSidebarItems = [
  { label: 'Home', path: '/dashboard', icon: <Home className="w-5 h-5 mr-2" /> },
  { label: 'Patient Registration & Book Issuance', path: '/personalDetails', icon: <UserPlus className="w-5 h-5 mr-2" /> },
  { label: 'Patient Records', path: '/patientRecords', icon: <FileText className="w-5 h-5 mr-2" /> },
  { label: 'Notifications', path: '/Notifications', icon: <Bell className="w-5 h-5 mr-2" /> },
  { label: 'Request Lost Book', path: '/RequestLostBook', icon: <Building2 className="w-5 h-5 mr-2" /> },
  { label: 'Logout', path: '/loginScreen', icon: <LogOut className="w-5 h-5 mr-2" />, action: 'logout' },
];

const StaffLayout = ({ children, title = "Patient Checkup Management System" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('/dashboard');

  // Monitor session timeout
  useSessionMonitor(true);

  // Update active tab based on current location
  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location.pathname]);

  // Logout handler
  const handleLogout = () => {
    logout();
    navigate('/loginScreen');
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300">
      {/* Sidebar */}
      <div className="w-64 min-h-screen bg-gradient-to-b from-blue-700 via-blue-600 to-cyan-600 shadow-xl flex flex-col divide-y divide-blue-500 text-white">
        {/* Hospital Header */}
        <div className="flex items-center gap-3 px-6 py-6">
          <Hospital className="w-10 h-10 text-white" />
          <span className="text-lg font-bold tracking-wide">Base Hospital - Avissawella</span>
        </div>
        
        {/* User Info */}
        {user && (
          <div className="px-6 py-4 bg-blue-800/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center">
                <span className="text-blue-800 font-semibold text-sm">
                  {user.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">{user.username}</p>
                <p className="text-xs text-blue-200">{user.position}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/change-password')}
              className="w-full text-left px-3 py-2 text-xs text-blue-200 hover:text-white hover:bg-blue-700/50 rounded-lg transition-colors"
            >
              🔑 Change Password
            </button>
          </div>
        )}
        
        {/* Navigation */}
        <nav className="flex-1 flex flex-col py-4">
          {staffSidebarItems.map((item, idx) => (
            item.action === 'logout' ? (
              <button
                key={idx}
                className={`flex items-center w-full px-6 py-3 transition rounded-r-full font-medium ${
                  activeTab === item.path
                    ? 'bg-blue-500/80 text-white shadow-lg'
                    : 'text-white/90 hover:bg-blue-500/60 hover:text-white'
                }`}
                onClick={handleLogout}
              >
                {item.icon}
                {item.label}
              </button>
            ) : (
              <Link
                key={idx}
                to={item.path}
                className={`flex items-center px-6 py-3 transition rounded-r-full font-medium ${
                  activeTab === item.path 
                    ? 'bg-blue-500/80 text-white shadow-lg' 
                    : 'text-white/90 hover:bg-blue-500/60 hover:text-white'
                }`}
                onClick={() => setActiveTab(item.path)}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
            <div className="flex items-center gap-4">
              {user && (
                <div className="text-sm text-gray-600">
                  Welcome, <span className="font-medium">{user.username}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default StaffLayout;