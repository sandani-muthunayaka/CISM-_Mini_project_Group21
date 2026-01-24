
const PDFDocument = require('pdfkit');
const Notification = require('../Model/notification');
const hospitalConfig = require('../Config/hospitalConfig');

function getSummaryPeriod(query) {
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
  
  return { createdAt: { $gte: fromDate } };
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

async function generateBookReport(res, query = {}) {
  const periodFilter = getSummaryPeriod(query);
  const notifications = await Notification.find({ 
    type: { $in: ['duplicate', 'lost_book', 'system', 'alert'] }, 
    ...periodFilter 
  });
  const periodName = getPeriodDisplayName(query.period);
  
  // Calculate notification statistics
  const duplicateIssues = notifications.filter(n => n.type === 'duplicate').length;
  const lostBookIssues = notifications.filter(n => n.type === 'lost_book').length;
  const systemAlerts = notifications.filter(n => n.type === 'system').length;
  const totalIssues = notifications.length;
  
  const doc = new PDFDocument({ margin: 40 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${periodName.toLowerCase()}_book_report.pdf`);

  // Hospital Header
  doc.fontSize(24).font('Helvetica-Bold').text(hospitalConfig.hospital.name, { align: 'center' });
  doc.fontSize(12).font('Helvetica').text(hospitalConfig.hospital.ministry, { align: 'center' });
  doc.text(`${hospitalConfig.hospital.address}`, { align: 'center' });
  doc.text(`Contact: ${hospitalConfig.hospital.phone} | Email: ${hospitalConfig.hospital.email}`, { align: 'center' });
  doc.moveDown(0.3);
  
  // Report Title
  doc.fontSize(16).font('Helvetica-Bold').text(`${periodName} System Activity & Notifications Report`, { align: 'center' });
  doc.fontSize(10).font('Helvetica').text(`Generated on: ${new Date().toLocaleString('en-US', { timeZone: hospitalConfig.hospital.timezone })}`, { align: 'center' });
  doc.text(`Report Period: ${periodName} | Total Issues: ${totalIssues}`, { align: 'center' });
  
  // Issue Statistics
  doc.moveDown(0.3);
  doc.fontSize(9).font('Helvetica').text(`Issue Breakdown: Duplicates: ${duplicateIssues} | Lost Books: ${lostBookIssues} | System Alerts: ${systemAlerts}`, { align: 'center' });
  doc.moveDown(0.5);
  
  // Add line separator
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.3);
  // Table header
  doc.fontSize(10).font('Helvetica-Bold');
  const headerY = doc.y;
  doc.text('#', 50, headerY);
  doc.text('Type', 75, headerY);
  doc.text('Details', 120, headerY);
  doc.text('Status', 305, headerY);
  doc.text('Date', 350, headerY);
  
  // Add header underline
  doc.moveDown(0.3);
  doc.moveTo(50, doc.y).lineTo(410, doc.y).stroke();
  doc.moveDown(0.3);
  
  doc.font('Helvetica');
  
  notifications.forEach((n, idx) => {
    doc.fontSize(9);
    const issueType = (n.type || 'unknown').charAt(0).toUpperCase() + (n.type || 'unknown').slice(1);
    const status = n.resolved ? 'Resolved' : 'Pending';
    
    const rowY = doc.y;
    doc.text(String(idx + 1), 50, rowY, { width: 20 });
    doc.text(issueType.substring(0, 6), 75, rowY, { width: 40 });
    doc.text((n.message || 'No description available').substring(0, 30), 120, rowY, { width: 180 });
    doc.text(status, 305, rowY, { width: 40 });
    doc.text(n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'N/A', 350, rowY, { width: 60 });
    
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

module.exports = generateBookReport;
