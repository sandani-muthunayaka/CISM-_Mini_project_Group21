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

  return (
    <AdminLayout title="Administrator Dashboard">
      <div className="flex flex-col items-center w-full py-10 px-4">

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
    </AdminLayout>
  );
};

export default AdminDashboard;