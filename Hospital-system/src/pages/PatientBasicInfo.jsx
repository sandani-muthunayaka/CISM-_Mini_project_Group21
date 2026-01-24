import React from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
  UserPlus,
  FileText,
  Bell,
  Building2,
  MoreHorizontal,
  Hospital,
  User,
  Hash,
  IdCard,
  Calendar,
  Venus,
  MapPin,
  Phone,
  Landmark,
  Globe,
  Map,
  MapPinned
} from 'lucide-react';

const patient = {
  registrationNumber: 'REG2024001',
  name: 'John Doe',
  nic: '123456789V',
  age: 35,
  dob: '1989-01-15',
  gender: 'Male',
  address: '123 Main Street, Colombo',
  telephone: '+94 77 123 4567',
  district: 'Colombo',
  mohArea: 'Colombo MOH',
  phmArea: 'Colombo PHM',
  phiArea: 'Colombo PHI',
};

const PatientBasicInfo = () => {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300">
      {/* Sidebar */}
      <div className="w-64 min-h-screen bg-gradient-to-b from-blue-700 via-blue-600 to-cyan-600 shadow-xl flex flex-col divide-y divide-blue-500 text-white">
        <div className="flex items-center gap-3 px-6 py-6">
          <Hospital className="w-10 h-10 text-white" />
          <span className="text-lg font-bold tracking-wide">Base Hospital - Avissawella</span>
        </div>
        <nav className="flex-1 flex flex-col py-4">
          {sidebarItems.map((item, idx) => (
            <Link
              key={idx}
              to={item.path}
              className={`flex items-center px-6 py-3 hover:bg-blue-500/60 transition rounded-r-full font-medium text-white/90 hover:text-white`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center w-full py-10 px-4">
        {/* Hospital Bar */}
        <div className="w-full max-w-3xl mb-2">
          <div className="bg-blue-700 rounded-t-xl py-3 px-6 text-center">
            <span className="text-white text-lg font-bold tracking-wide">Base Hospital - Avissawella</span>
          </div>
        </div>
        {/* Header */}
        <div className="w-full max-w-3xl mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-800 flex items-center gap-3 bg-white rounded-b-xl py-6 px-6 shadow">
            <User className="w-7 h-7 text-cyan-600" />
            Patient Basic Information
          </h1>
        </div>
        {/* Card */}
        <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg border border-blue-200 p-8">
          {/* Basic Information Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4 border-b-2 border-blue-300 pb-2">
              <User className="w-5 h-5 text-blue-600" />
              <span className="text-lg font-bold text-blue-800">Basic Information</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-700">Registration No:</span>
                <span className="text-gray-800">{patient.registrationNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-700">Name:</span>
                <span className="text-gray-800">{patient.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <IdCard className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-700">NIC:</span>
                <span className="text-gray-800">{patient.nic}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-700">Age:</span>
                <span className="text-gray-800">{patient.age}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-700">DOB:</span>
                <span className="text-gray-800">{patient.dob}</span>
              </div>
              <div className="flex items-center gap-2">
                <Venus className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-700">Gender:</span>
                <span className="text-gray-800">{patient.gender}</span>
              </div>
            </div>
          </div>
          {/* Contact Details Section */}
          <div>
            <div className="flex items-center gap-2 mb-4 border-b-2 border-blue-300 pb-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span className="text-lg font-bold text-blue-800">Contact Details</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-700">Address:</span>
                <span className="text-gray-800">{patient.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-700">TP num:</span>
                <span className="text-gray-800">{patient.telephone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-700">District:</span>
                <span className="text-gray-800">{patient.district}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-700">MOH area:</span>
                <span className="text-gray-800">{patient.mohArea}</span>
              </div>
              <div className="flex items-center gap-2">
                <Map className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-700">PHM area:</span>
                <span className="text-gray-800">{patient.phmArea}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPinned className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-700">PHI area:</span>
                <span className="text-gray-800">{patient.phiArea}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientBasicInfo; 