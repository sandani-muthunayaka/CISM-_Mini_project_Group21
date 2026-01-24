const PDFDocument = require('pdfkit');
const Patient = require('./Model/patient'); // Use comprehensive patient model
const hospitalConfig = require('../Config/hospitalConfig');

// Helper function to get date filter based on period
function getDateFilter(query) {
  const now = new Date();
  let fromDate;
  
  switch (query.period) {
    case 'daily':
      fromDate = new Date();
      fromDate.setHours(0, 0, 0, 0);
      break;
    case 'weekly':
      fromDate = new Date();
      fromDate.setDate(now.getDate() - 7);
      break;
    case 'monthly':
      fromDate = new Date();
      fromDate.setMonth(now.getMonth() - 1);
      break;
    case 'annually':
      fromDate = new Date();
      fromDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      return {}; // No filter for all data
  }
  
  return { created_at: { $gte: fromDate } };
}

// Helper function to get period display name
function getPeriodDisplayName(period) {
  const periodMap = {
    daily: 'Daily',
    weekly: 'Weekly', 
    monthly: 'Monthly',
    annually: 'Annual'
  };
  return periodMap[period] || 'Complete';
}

async function generatePatientReport(res, query = {}) {
  const dateFilter = getDateFilter(query);
  // Get comprehensive patient data including medical records
  const patients = await Patient.find(dateFilter);
  const periodName = getPeriodDisplayName(query.period);
  
  // Calculate medical statistics
  let totalOPDVisits = 0;
  let totalHospitalizations = 0;
  let totalMedications = 0;
  let totalImmunizations = 0;
  
  patients.forEach(patient => {
    if (patient.tab2) {
      totalOPDVisits += (patient.tab2.opdRecords || []).length;
      totalHospitalizations += (patient.tab2.hospitalizationRecords || []).length;
    }
    if (patient.tab4) {
      totalMedications += (patient.tab4.medicationRecords || []).length;
      totalImmunizations += (patient.tab4.immunizationRecords || []).length;
    }
  });
  
  const doc = new PDFDocument({ margin: 40 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${periodName.toLowerCase()}_patient_report.pdf`);
  
  // Hospital Header
  doc.fontSize(24).font('Helvetica-Bold').text(hospitalConfig.hospital.name, { align: 'center' });
  doc.fontSize(12).font('Helvetica').text(hospitalConfig.hospital.ministry, { align: 'center' });
  doc.text(`${hospitalConfig.hospital.address}`, { align: 'center' });
  doc.text(`Contact: ${hospitalConfig.hospital.phone} | Email: ${hospitalConfig.hospital.email}`, { align: 'center' });
  doc.moveDown(0.3);
  
  // Report Title
  doc.fontSize(16).font('Helvetica-Bold').text(`${periodName} Patient Medical Summary Report`, { align: 'center' });
  doc.fontSize(10).font('Helvetica').text(`Generated on: ${new Date().toLocaleString('en-US', { timeZone: hospitalConfig.hospital.timezone })}`, { align: 'center' });
  doc.text(`Report Period: ${periodName} | Total Patients: ${patients.length}`, { align: 'center' });
  
  // Medical Statistics
  doc.moveDown(0.3);
  doc.fontSize(9).font('Helvetica').text(`Medical Activity Summary: OPD Visits: ${totalOPDVisits} | Hospitalizations: ${totalHospitalizations} | Active Medications: ${totalMedications} | Immunizations: ${totalImmunizations}`, { align: 'center' });
  doc.moveDown(0.5);
  
  // Add line separator
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.3);
  
  // Table header
  doc.fontSize(10).font('Helvetica-Bold');
  const headerY = doc.y;
  doc.text('#', 50, headerY);
  doc.text('ID', 75, headerY);
  doc.text('Name', 125, headerY);
  doc.text('Age/Sex', 190, headerY);
  doc.text('OPD', 240, headerY);
  doc.text('Hosp', 270, headerY);
  doc.text('Med', 305, headerY);
  doc.text('Phone', 335, headerY);
  doc.text('Reg Date', 400, headerY);
  // Add header underline
  doc.moveDown(0.3);
  doc.moveTo(50, doc.y).lineTo(460, doc.y).stroke();
  doc.moveDown(0.3);
  
  doc.font('Helvetica');
  
  patients.forEach((p, idx) => {
    const basicInfo = p.tab1 || {};
    const medicalInfo = p.tab2 || {};
    const medicationInfo = p.tab4 || {};
    
    const opdCount = (medicalInfo.opdRecords || []).length;
    const hospCount = (medicalInfo.hospitalizationRecords || []).length;
    const medCount = (medicationInfo.medicationRecords || []).length;
    
    doc.fontSize(9);
    const rowY = doc.y;
    doc.text(String(idx + 1), 50, rowY, { width: 20 });
    doc.text((p.patientId || 'N/A').substring(0, 7), 75, rowY, { width: 45 });
    doc.text((basicInfo.name || basicInfo.firstName || 'Unknown').substring(0, 8), 125, rowY, { width: 60 });
    doc.text(`${basicInfo.age || 'N/A'}/${(basicInfo.gender || 'U').charAt(0)}`, 190, rowY, { width: 45 });
    doc.text(String(opdCount), 240, rowY, { width: 25 });
    doc.text(String(hospCount), 270, rowY, { width: 30 });
    doc.text(String(medCount), 305, rowY, { width: 25 });
    doc.text((basicInfo.contact || basicInfo.phone || 'N/A').substring(0, 8), 335, rowY, { width: 60 });
    doc.text(p.created_at ? new Date(p.created_at).toLocaleDateString() : 'N/A', 400, rowY, { width: 60 });
    
    doc.moveDown(0.4); // Reduced space between rows
  });
  
  // Footer
  doc.moveDown(1);
  doc.fontSize(8).font('Helvetica').text(hospitalConfig.reportSettings.footerText, 40, doc.y, { align: 'center', width: 515 });
  doc.moveDown(0.3);
  doc.text(hospitalConfig.reportSettings.confidentialityNotice, 40, doc.y, { align: 'center', width: 515 });
  
  doc.end();
  doc.pipe(res);
}

module.exports = generatePatientReport;
