import React, { useState } from 'react';
import docImg from '../assets/doctor.png';
import nurImg from '../assets/nurse.png';
import pharImg from '../assets/phar.png';
import patImg from '../assets/patient.png';
import labImg from '../assets/lab.png';
import AdminLayout from '../components/AdminLayout';
import { Link } from 'react-router-dom';
import {
  UserPlus,
  Stethoscope,
  UserCog,
  BriefcaseMedical,
  Users,
  FlaskConical,
  UserCheck,
  Settings,
  BarChart3,
  Shield,
} from 'lucide-react';
import { apiGet } from '../utils/apiClient';

// Admin sidebar items moved to AdminLayout component

// Dynamic stats state
const initialStats = [
  {
    label: 'Doctors',
    value: 0,
    icon: <Stethoscope className="w-8 h-8 text-purple-600 mb-2" />,
    img: docImg,
  },
  {
    label: 'Nurses',
    value: 0,
    icon: <UserCog className="w-8 h-8 text-purple-600 mb-2" />,
    img: nurImg,
  },
  {
    label: 'Pharmacists',
    value: 0,
    icon: <BriefcaseMedical className="w-8 h-8 text-purple-600 mb-2" />,
    img: pharImg,
  },
  {
    label: 'Patients',
    value: 0,
    icon: <Users className="w-8 h-8 text-purple-600 mb-2" />,
    img: patImg,
  },
  {
    label: 'Laboratorists',
    value: 0,
    icon: <FlaskConical className="w-8 h-8 text-purple-600 mb-2" />,
    img: labImg,
  },
  {
    label: 'Pending Staff',
    value: 0,
    icon: <UserCheck className="w-8 h-8 text-purple-600 mb-2" />,
    img: docImg,
  },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState(initialStats);

  // Fetch stats from backend
  React.useEffect(() => {
    apiGet('/stats')
      .then(data => {
        setStats(prev => prev.map(stat => {
          if (stat.label === 'Doctors') return { ...stat, value: data.doctors };
          if (stat.label === 'Nurses') return { ...stat, value: data.nurses };
          if (stat.label === 'Pharmacists') return { ...stat, value: data.pharmacists };
          if (stat.label === 'Laboratorists') return { ...stat, value: data.laboratorists };
          if (stat.label === 'Patients') return { ...stat, value: data.patients };
          return stat;
        }));
      })
      .catch(err => console.error('Error fetching stats:', err));

    // Fetch pending staff count
    apiGet('/admin/staff/pending')
      .then(data => {
        setStats(prev => prev.map(stat => 
          stat.label === 'Pending Staff' ? { ...stat, value: data.length } : stat
        ));
      })
      .catch(err => console.error('Error fetching pending staff:', err));
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    navigate('/admin-login');
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-purple-100 via-purple-200 to-indigo-300">
      {/* Admin Sidebar */}
      <div className="w-64 min-h-screen bg-gradient-to-b from-purple-700 via-purple-600 to-indigo-600 shadow-xl flex flex-col divide-y divide-purple-500 text-white">
        <div className="flex items-center gap-3 px-6 py-6">
          <Crown className="w-10 h-10 text-yellow-300" />
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-wide">Admin Panel</span>
            <span className="text-sm text-purple-200">Base Hospital - Avissawella</span>
          </div>
        </div>
        
        {/* Admin Info */}
        {user && (
          <div className="px-6 py-4 bg-purple-800/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <Crown className="w-4 h-4 text-purple-800" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{user.username}</p>
                <p className="text-xs text-purple-200">{user.position}</p>
              </div>
            </div>
          </div>
        )}
        
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
      <div className="flex-1 flex flex-col items-center w-full py-10 px-4">
        {/* Hospital Bar */}
        <div className="w-full max-w-5xl mb-2">
          <div className="bg-gradient-to-r from-purple-700 to-indigo-700 rounded-t-xl py-3 px-6 text-center">
            <span className="text-white text-lg font-bold tracking-wide flex items-center justify-center gap-2">
              <Crown className="w-5 h-5 text-yellow-300" />
              Administrator Dashboard - Base Hospital Avissawella
            </span>
          </div>
        </div>
        
        {/* Header */}
        <div className="w-full max-w-5xl mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-purple-800 flex items-center gap-3 bg-white rounded-b-xl py-6 px-6 shadow">
            <ShieldCheck className="w-7 h-7 text-purple-600" />
            Hospital Management System - Admin Control Panel
          </h1>
        </div>

        {/* Stats Grid */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {stats.slice(0, 3).map((stat, idx) => (
            <div key={stat.label} className="flex flex-col items-center p-6 rounded-2xl bg-white shadow-lg border border-purple-100 hover:shadow-xl transition-all">
              {stat.icon}
              <img src={stat.img} alt={stat.label} className="w-16 h-16 mb-2" />
              <span className="text-lg font-semibold text-purple-800">{stat.label}</span>
              <span className="text-2xl font-bold text-purple-700">{stat.value}</span>
            </div>
          ))}
        </div>
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {stats.slice(3).map((stat, idx) => (
            <div key={stat.label} className="flex flex-col items-center p-6 rounded-2xl bg-white shadow-lg border border-purple-100 hover:shadow-xl transition-all">
              {stat.icon}
              <img src={stat.img} alt={stat.label} className="w-16 h-16 mb-2" />
              <span className="text-lg font-semibold text-purple-800">{stat.label}</span>
              <span className="text-2xl font-bold text-purple-700">{stat.value}</span>
              
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;