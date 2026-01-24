const PDFDocument = require('pdfkit');
const Patient = require('../Model/patient');
const Staff = require('../Model/staff');
const Notification = require('../Model/notification');
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

async function generateSummaryReport(res, query = {}) {
  try {
    const dateFilter = getDateFilter(query);
    const periodName = getPeriodDisplayName(query.period);
    
    // Get comprehensive data from all sources
    const Patient = require('./Model/patient'); // Use comprehensive patient model
    const patients = await Patient.find(dateFilter);
    const staff = await Staff.find(dateFilter);
    
    // Fix notification query - use proper date filter
    let notificationFilter = {};
    if (dateFilter.created_at) {
      notificationFilter.createdAt = dateFilter.created_at;
    }
    const notifications = await Notification.find(notificationFilter);
    
    // Calculate comprehensive medical statistics
    let totalOPDVisits = 0;
    let totalHospitalizations = 0;
    let activeMedications = 0;
    let completedImmunizations = 0;
    let malePatients = 0;
    let femalePatients = 0;
    let totalAge = 0;
    let patientsWithAge = 0;
    
    patients.forEach(patient => {
      // Extract demographics from tab1
      const demographics = patient.tab1 || {};
      if (demographics.gender === 'male' || demographics.gender === 'Male') malePatients++;
      if (demographics.gender === 'female' || demographics.gender === 'Female') femalePatients++;
      if (demographics.age) {
        totalAge += parseInt(demographics.age);
        patientsWithAge++;
      }
      
      // Extract medical records from tab2
      if (patient.tab2) {
        totalOPDVisits += (patient.tab2.opdRecords || []).length;
        totalHospitalizations += (patient.tab2.hospitalizationRecords || []).length;
      }
      
      // Extract medication and immunization records from tab4
      if (patient.tab4) {
        activeMedications += (patient.tab4.medicationRecords || []).length;
        completedImmunizations += (patient.tab4.immunizationRecords || []).filter(i => i.status === 'Completed').length;
      }
    });
    
    const stats = {
      totalPatients: patients.length,
      totalStaff: staff.length,
      activeStaff: staff.filter(s => s.status === 'accepted').length,
      pendingStaff: staff.filter(s => s.status === 'pending').length,
      adminStaff: staff.filter(s => s.isAdmin).length,
      totalNotifications: notifications.length,
      malePatients,
      femalePatients,
      avgAge: patientsWithAge > 0 ? (totalAge / patientsWithAge).toFixed(1) : 0,
      totalOPDVisits,
      totalHospitalizations,
      activeMedications,
      completedImmunizations,
      systemAlerts: notifications.filter(n => n.type === 'system').length,
      duplicateIssues: notifications.filter(n => n.type === 'duplicate').length,
      lostBookIssues: notifications.filter(n => n.type === 'lost_book').length
    };
    
    const doc = new PDFDocument({ margin: 40 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${periodName.toLowerCase()}_summary_report.pdf`);
    
    // Hospital Header
    doc.fontSize(24).font('Helvetica-Bold').text(hospitalConfig.hospital.name, { align: 'center' });
    doc.fontSize(12).font('Helvetica').text(hospitalConfig.hospital.ministry, { align: 'center' });
    doc.text(`${hospitalConfig.hospital.address}`, { align: 'center' });
    doc.text(`Contact: ${hospitalConfig.hospital.phone} | Email: ${hospitalConfig.hospital.email}`, { align: 'center' });
    doc.moveDown(0.5);
    
    // Report Title
    doc.fontSize(16).font('Helvetica-Bold').text(`${periodName} Hospital Summary Report`, { align: 'center' });
    doc.fontSize(10).font('Helvetica').text(`Generated on: ${new Date().toLocaleString('en-US', { timeZone: hospitalConfig.hospital.timezone })}`, { align: 'center' });
    doc.text(`Report Period: ${periodName} | Total Records: ${stats.totalPatients + stats.totalStaff + stats.totalNotifications}`, { align: 'center' });
    
    // Summary Statistics
    doc.moveDown(0.3);
    doc.fontSize(9).font('Helvetica').text(`Hospital Overview: Patients: ${stats.totalPatients} | Staff: ${stats.totalStaff} | Active Issues: ${stats.systemAlerts + stats.duplicateIssues + stats.lostBookIssues} | Medical Activities: ${stats.totalOPDVisits + stats.totalHospitalizations}`, { align: 'center' });
    doc.moveDown(0.5);
    
    // Add line separator
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.3);
    
    // Table header
    doc.fontSize(10).font('Helvetica-Bold');
    const headerY = doc.y;
    doc.text('#', 50, headerY);
    doc.text('Category', 80, headerY);
    doc.text('Metric', 160, headerY);
    doc.text('Count', 280, headerY);
    doc.text('Percentage', 320, headerY);
    doc.text('Status', 380, headerY);
    doc.text('Notes', 420, headerY);
    
    // Add header underline
    doc.moveDown(0.3);
    doc.moveTo(50, doc.y).lineTo(500, doc.y).stroke();
    doc.moveDown(0.3);
    
    doc.font('Helvetica');
    
    // Create summary data rows
    const summaryData = [
      { category: 'Patients', metric: 'Total Registered', count: stats.totalPatients, percentage: '100%', status: 'Active', notes: 'All Records' },
      { category: 'Patients', metric: 'Male Patients', count: stats.malePatients, percentage: `${stats.totalPatients > 0 ? ((stats.malePatients/stats.totalPatients)*100).toFixed(1) : 0}%`, status: 'Active', notes: 'Demographics' },
      { category: 'Patients', metric: 'Female Patients', count: stats.femalePatients, percentage: `${stats.totalPatients > 0 ? ((stats.femalePatients/stats.totalPatients)*100).toFixed(1) : 0}%`, status: 'Active', notes: 'Demographics' },
      { category: 'Medical', metric: 'OPD Visits', count: stats.totalOPDVisits, percentage: '-', status: 'Complete', notes: 'Outpatient' },
      { category: 'Medical', metric: 'Hospitalizations', count: stats.totalHospitalizations, percentage: '-', status: 'Complete', notes: 'Inpatient' },
      { category: 'Medical', metric: 'Medications', count: stats.activeMedications, percentage: '-', status: 'Active', notes: 'Prescriptions' },
      { category: 'Medical', metric: 'Immunizations', count: stats.completedImmunizations, percentage: '-', status: 'Complete', notes: 'Vaccines' },
      { category: 'Staff', metric: 'Total Staff', count: stats.totalStaff, percentage: '100%', status: 'All', notes: 'All Records' },
      { category: 'Staff', metric: 'Active Staff', count: stats.activeStaff, percentage: `${stats.totalStaff > 0 ? ((stats.activeStaff/stats.totalStaff)*100).toFixed(1) : 0}%`, status: 'Active', notes: 'Working' },
      { category: 'Staff', metric: 'Pending Staff', count: stats.pendingStaff, percentage: `${stats.totalStaff > 0 ? ((stats.pendingStaff/stats.totalStaff)*100).toFixed(1) : 0}%`, status: 'Pending', notes: 'Awaiting' },
      { category: 'Staff', metric: 'Admin Staff', count: stats.adminStaff, percentage: `${stats.totalStaff > 0 ? ((stats.adminStaff/stats.totalStaff)*100).toFixed(1) : 0}%`, status: 'Admin', notes: 'Privileged' },
      { category: 'System', metric: 'Notifications', count: stats.totalNotifications, percentage: '100%', status: 'All', notes: 'All Alerts' },
      { category: 'System', metric: 'System Alerts', count: stats.systemAlerts, percentage: `${stats.totalNotifications > 0 ? ((stats.systemAlerts/stats.totalNotifications)*100).toFixed(1) : 0}%`, status: 'Alert', notes: 'Technical' },
      { category: 'System', metric: 'Lost Books', count: stats.lostBookIssues, percentage: `${stats.totalNotifications > 0 ? ((stats.lostBookIssues/stats.totalNotifications)*100).toFixed(1) : 0}%`, status: 'Issue', notes: 'Missing' },
      { category: 'System', metric: 'Duplicates', count: stats.duplicateIssues, percentage: `${stats.totalNotifications > 0 ? ((stats.duplicateIssues/stats.totalNotifications)*100).toFixed(1) : 0}%`, status: 'Issue', notes: 'Cleanup' }
    ];
    
    summaryData.forEach((item, idx) => {
      doc.fontSize(9);
      const rowY = doc.y;
      doc.text(String(idx + 1), 50, rowY, { width: 20 });
      doc.text(item.category.substring(0, 8), 80, rowY, { width: 75 });
      doc.text(item.metric.substring(0, 12), 160, rowY, { width: 115 });
      doc.text(String(item.count), 280, rowY, { width: 35 });
      doc.text(item.percentage, 320, rowY, { width: 55 });
      doc.text(item.status.substring(0, 8), 380, rowY, { width: 35 });
      doc.text(item.notes.substring(0, 10), 420, rowY, { width: 75 });
      
      doc.moveDown(0.4); // Space between rows
    });

    
    // Footer
    doc.moveDown(1);
    doc.fontSize(8).font('Helvetica').text(hospitalConfig.reportSettings.footerText, 40, doc.y, { align: 'center', width: 515 });
    doc.moveDown(0.3);
    doc.text(hospitalConfig.reportSettings.confidentialityNotice, 40, doc.y, { align: 'center', width: 515 });
    
    doc.end();
    doc.pipe(res);
    
  } catch (error) {
    console.error('Error generating summary report:', error);
    res.status(500).json({ error: 'Failed to generate summary report' });
  }
}

module.exports = generateSummaryReport;