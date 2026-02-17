import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  UserCheck,
  UserCog,
  Shield,
  UserPlus,
  FileText,
  Bell,
  BarChart3,
  Building2,
  Settings,
  Crown,
  LogOut,
} from 'lucide-react';
import useAuth from '../utils/useAuth';
import useSessionMonitor from '../utils/useSessionMonitor';

const adminSidebarItems = [
  { label: 'Admin Home', path: '/admin-dashboard', icon: <Home className="w-5 h-5 mr-2" /> },
  { label: 'Staff Management', path: '/AdminStaffVerification', icon: <UserCheck className="w-5 h-5 mr-2" /> },
  { label: 'Pending Staff Requests', path: '/PendingStaffRequests', icon: <UserCog className="w-5 h-5 mr-2" /> },
  { label: 'Password Requests', path: '/AdminPasswordRequests', icon: <Shield className="w-5 h-5 mr-2" /> },
  { label: 'Patient Registration & Book Issuance', path: '/personalDetails', icon: <UserPlus className="w-5 h-5 mr-2" /> },
  { label: 'Patient Records', path: '/patientRecords', icon: <FileText className="w-5 h-5 mr-2" /> },
  { label: 'Notifications', path: '/Notifications', icon: <Bell className="w-5 h-5 mr-2" /> },
  { label: 'Reports & Analytics', path: '/Reports', icon: <BarChart3 className="w-5 h-5 mr-2" /> },
  { label: 'Audit Logs', path: '/audit-logs', icon: <Shield className="w-5 h-5 mr-2" /> },
  { label: 'Request Lost Book', path: '/RequestLostBook', icon: <Building2 className="w-5 h-5 mr-2" /> },
//   admin
  { label: 'Logout', path: '/admin-login', icon: <LogOut className="w-5 h-5 mr-2" />, action: 'logout' },
];

const AdminLayout = ({ children, title = "Admin Control Panel" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('/admin-dashboard');

  // Monitor session timeout
  useSessionMonitor(true);

  // Update active tab based on current location
  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location.pathname]);

  // Logout handler
  const handleLogout = () => {
    logout();
    navigate('/admin-login');
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-purple-100 via-purple-200 to-indigo-300">
      {/* Admin Sidebar */}
      <div className="w-64 min-h-screen bg-gradient-to-b from-purple-700 via-purple-600 to-indigo-600 shadow-xl flex flex-col divide-y divide-purple-500 text-white">
        {/* Admin Header */}
        <div className="flex items-center gap-3 px-6 py-6">
          <Crown className="w-10 h-10 text-yellow-300" />
          <span className="text-lg font-bold tracking-wide">Base Hospital - Avissawella</span>
        </div>
        
        {/* Admin User Info */}
        {user && (
          <div className="px-6 py-4 bg-purple-800/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <Crown className="w-4 h-4 text-purple-800" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{user.username}</p>
                <p className="text-xs text-purple-200">{user.position}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/change-password')}
              className="w-full text-left px-3 py-2 text-xs text-purple-200 hover:text-white hover:bg-purple-700/50 rounded-lg transition-colors"
            >
              🔑 Change Password
            </button>
          </div>
        )}
        
        {/* Admin Navigation */}
        <nav className="flex-1 flex flex-col py-4">
          {adminSidebarItems.map((item, idx) => (
            item.action === 'logout' ? (
              <button
                key={idx}
                className={`flex items-center w-full px-6 py-3 transition rounded-r-full font-medium ${
                  activeTab === item.path
                    ? 'bg-purple-500/80 text-white shadow-lg'
                    : 'text-white/90 hover:bg-purple-500/60 hover:text-white'
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
                    ? 'bg-purple-500/80 text-white shadow-lg' 
                    : 'text-white/90 hover:bg-purple-500/60 hover:text-white'
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
        {/* Admin Header Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6 text-purple-600" />
              <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <div className="text-sm text-gray-600">
                  Admin: <span className="font-medium text-purple-600">{user.username}</span>
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

export default AdminLayout;