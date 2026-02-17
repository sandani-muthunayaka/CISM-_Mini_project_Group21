const PDFDocument = require('pdfkit');
const Staff = require('../Model/staff');
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

async function generateStaffReport(res, query = {}) {
  const dateFilter = getDateFilter(query);
  const staffList = await Staff.find(dateFilter);
  const periodName = getPeriodDisplayName(query.period);
  
  // Calculate staff statistics
  const activeStaff = staffList.filter(s => s.status === 'accepted').length;
  const pendingStaff = staffList.filter(s => s.status === 'pending').length;
  const adminStaff = staffList.filter(s => s.isAdmin).length;
  const recentLogins = staffList.filter(s => s.lastLoginAt && new Date(s.lastLoginAt) > new Date(Date.now() - 7*24*60*60*1000)).length;
  
  const doc = new PDFDocument({ margin: 40 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${periodName.toLowerCase()}_staff_report.pdf`);
  
  // Hospital Header
  doc.fontSize(24).font('Helvetica-Bold').text(hospitalConfig.hospital.name, { align: 'center' });
  doc.fontSize(12).font('Helvetica').text(hospitalConfig.hospital.ministry, { align: 'center' });
  doc.text(`${hospitalConfig.hospital.address}`, { align: 'center' });
  doc.text(`Contact: ${hospitalConfig.hospital.phone} | Email: ${hospitalConfig.hospital.email}`, { align: 'center' });
  doc.moveDown(0.3);
  
  // Report Title
  doc.fontSize(16).font('Helvetica-Bold').text(`${periodName} Staff Management Report`, { align: 'center' });
  doc.fontSize(10).font('Helvetica').text(`Generated on: ${new Date().toLocaleString('en-US', { timeZone: hospitalConfig.hospital.timezone })}`, { align: 'center' });
  doc.text(`Report Period: ${periodName} | Total Staff: ${staffList.length}`, { align: 'center' });
  
  // Staff Statistics
  doc.moveDown(0.3);
  doc.fontSize(9).font('Helvetica').text(`Staff Status: Active: ${activeStaff} | Pending: ${pendingStaff} | Administrators: ${adminStaff} | Active This Week: ${recentLogins}`, { align: 'center' });
  doc.moveDown(0.5);
  
  // Add line separator
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.3);
  // Table header
  doc.fontSize(10).font('Helvetica-Bold');
  const headerY = doc.y;
  doc.text('#', 50, headerY);
  doc.text('EmpID', 75, headerY);
  doc.text('Name', 120, headerY);
  doc.text('Role', 180, headerY);
  doc.text('Status', 240, headerY);
  doc.text('Admin', 285, headerY);
  doc.text('Login', 325, headerY);
  doc.text('Joined', 380, headerY);
  // Add header underline
  doc.moveDown(0.3);
  doc.moveTo(50, doc.y).lineTo(430, doc.y).stroke();
  doc.moveDown(0.3);
  
  doc.font('Helvetica');
  
  staffList.forEach((s, idx) => {
    doc.fontSize(9);
    const rowY = doc.y;
    doc.text(String(idx + 1), 50, rowY, { width: 20 });
    doc.text((s.employee_number || 'N/A').substring(0, 6), 75, rowY, { width: 40 });
    doc.text((s.username || 'N/A').substring(0, 7), 120, rowY, { width: 55 });
    doc.text((s.position || 'N/A').substring(0, 8), 180, rowY, { width: 55 });
    doc.text((s.status || 'N/A').charAt(0).toUpperCase() + (s.status || 'N/A').slice(1).substring(0, 5), 240, rowY, { width: 40 });
    doc.text(s.isAdmin ? 'Yes' : 'No', 285, rowY, { width: 35 });
    doc.text(s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleDateString() : 'Never', 325, rowY, { width: 50 });
    doc.text(s.created_at ? new Date(s.created_at).toLocaleDateString() : 'N/A', 380, rowY, { width: 50 });
    
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

module.exports = generateStaffReport;
