// Hospital Configuration for Reports and Official Documents
module.exports = {
  hospital: {
    name: 'BASE HOSPITAL - AVISSAWELLA',
    ministry: 'Ministry of Health, Sri Lanka',
    address: 'Hospital Road, Avissawella 10700, Sri Lanka',
    phone: '+94 36 222 3456',
    fax: '+94 36 222 3457', 
    email: 'info@basehospital-avissawella.health.gov.lk',
    website: 'www.basehospital-avissawella.health.gov.lk',
    director: 'Dr. Kumara Perera',
    directorTitle: 'Director/Consultant Physician',
    establishedYear: '1978',
    license: 'HL/REG/2023/001',
    timezone: 'Asia/Colombo'
  },
  
  reportSettings: {
    logoPath: null, // Can be set to logo file path if available
    footerText: 'This is a computer-generated report from Hospital Management System',
    confidentialityNotice: 'CONFIDENTIAL: This document contains sensitive medical information and should be handled accordingly.',
    defaultPeriods: ['daily', 'weekly', 'monthly', 'annually'],
    maxRecordsPerPage: 25
  }
};