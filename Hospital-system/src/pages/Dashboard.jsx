import React, { useState } from 'react';
import docImg from '../assets/doctor.png';
import nurImg from '../assets/nurse.png';
import pharImg from '../assets/phar.png';
import patImg from '../assets/patient.png';
import labImg from '../assets/lab.png';
import StaffLayout from '../components/StaffLayout';
import {
  Stethoscope,
  UserCog,
  BriefcaseMedical,
  Users,
  FlaskConical,
  ShieldCheck,
} from 'lucide-react';

// Dynamic stats state
const initialStats = [
  {
    label: 'Doctors',
    value: 0,
    icon: <Stethoscope className="w-8 h-8 text-cyan-600 mb-2" />,
    img: docImg,
  },
  {
    label: 'Nurses',
    value: 0,
    icon: <UserCog className="w-8 h-8 text-cyan-600 mb-2" />,
    img: nurImg,
  },
  {
    label: 'Pharmacists',
    value: 0,
    icon: <BriefcaseMedical className="w-8 h-8 text-cyan-600 mb-2" />,
    img: pharImg,
  },
  {
    label: 'Patients',
    value: 0,
    icon: <Users className="w-8 h-8 text-cyan-600 mb-2" />,
    img: patImg,
  },
  {
    label: 'Laboratorists',
    value: 0,
    icon: <FlaskConical className="w-8 h-8 text-cyan-600 mb-2" />,
    img: labImg,
  },
  {
    label: 'Extra',
    value: 0,
    icon: <ShieldCheck className="w-8 h-8 text-cyan-600 mb-2" />,
    img: docImg,
  },
];

const Dashboard = () => {
  const [stats, setStats] = useState(initialStats);

  // Fetch stats from backend
  React.useEffect(() => {
    fetch('http://localhost:3000/stats')
      .then(res => res.json())
      .then(data => {
        setStats(prev => prev.map(stat => {
          if (stat.label === 'Doctors') return { ...stat, value: data.doctors };
          if (stat.label === 'Nurses') return { ...stat, value: data.nurses };
          if (stat.label === 'Pharmacists') return { ...stat, value: data.pharmacists };
          if (stat.label === 'Laboratorists') return { ...stat, value: data.laboratorists };
          if (stat.label === 'Patients') return { ...stat, value: data.patients };
          return stat;
        }));
      });
  }, []);

  return (
    <StaffLayout title="Staff Dashboard">
      <div className="flex flex-col items-center w-full py-10 px-4">
        {/* Welcome Section */}
        <div className="w-full max-w-5xl mb-8">
          <div className="bg-white rounded-xl py-6 px-6 shadow-lg">
            <h1 className="text-2xl md:text-3xl font-bold text-blue-800 flex items-center gap-3">
              <ShieldCheck className="w-7 h-7 text-cyan-600" />
              Patient checkup management system
            </h1>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {stats.slice(0, 3).map((stat, idx) => (
            <div key={stat.label} className="flex flex-col items-center p-6 rounded-2xl bg-white shadow-lg border border-blue-100 hover:shadow-xl transition-all">
              {stat.icon}
              <img src={stat.img} alt={stat.label} className="w-16 h-16 mb-2" />
              <span className="text-lg font-semibold text-blue-800">{stat.label}</span>
              <span className="text-2xl font-bold text-cyan-700">{stat.value}</span>
            </div>
          ))}
        </div>
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {stats.slice(3).map((stat, idx) => (
            <div key={stat.label} className="flex flex-col items-center p-6 rounded-2xl bg-white shadow-lg border border-blue-100 hover:shadow-xl transition-all">
              {stat.icon}
              <img src={stat.img} alt={stat.label} className="w-16 h-16 mb-2" />
              <span className="text-lg font-semibold text-blue-800">{stat.label}</span>
              <span className="text-2xl font-bold text-cyan-700">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    </StaffLayout>
  );
};

export default Dashboard;
