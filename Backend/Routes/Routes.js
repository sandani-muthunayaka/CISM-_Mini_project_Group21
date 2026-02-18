const express = require('express');
const router = express.Router();

// Import middleware
const authenticate = require('../Middleware/authMiddleware');
const { requireAdmin, canWritePatientRecords, canViewPatientRecords } = require('../Middleware/rbacMiddleware');
const { 
  validatePatientData, 
  validateStaffData, 
  sanitizeInput,
  createRateLimiter 
} = require('../Middleware/validationMiddleware');
const { 
  verifyPatientOwnership, 
  filterOwnedPatients, 
  verifyWriteAccess 
} = require('../Middleware/ownershipMiddleware');

// Apply rate limiting globally
const rateLimiter = createRateLimiter();
router.use(rateLimiter);

// Apply input sanitization globally
router.use(sanitizeInput);

// ========== PUBLIC ROUTES (No Authentication Required) ==========

// Login route - public
const loginStaff = require('../Functions/user/login');
router.post('/login', loginStaff);

// Admin creation route (for initial setup) - public
const { createAdmin } = require('../Functions/admin/createInitialAdmin');
router.post('/admin/create-initial', createAdmin);

// Staff registration - public (but subject to admin approval)
const registerStaff = require('../Functions/user/registerStaff');
router.post('/register', validateStaffData, registerStaff);

// ========== PROTECTED ROUTES (Authentication Required) ==========

// Patient routes - require authentication + ownership verification
const savePatient = require('../Functions/user/savePatient');
router.post('/patient/save', authenticate, canWritePatientRecords, validatePatientData, savePatient);

const getPatient = require('../Functions/user/getPatient');
router.get('/patient/:patientId', authenticate, canViewPatientRecords, verifyPatientOwnership, getPatient);

const getAllPatients = require('../Functions/user/getAllPatients');
router.get('/patients', authenticate, canViewPatientRecords, filterOwnedPatients, getAllPatients);

// Medication routes - require authentication, role-based access, and ownership
const medicationRoutes = require('./medication');
router.use('/patient', authenticate, medicationRoutes);

// Hospitalization routes - require authentication, role-based access, and ownership
const hospitalizationRoutes = require('./hospitalization');
router.use('/patient', authenticate, hospitalizationRoutes);

// OPD routes - require authentication, role-based access, and ownership
const opdRoutes = require('./opd');
router.use('/patient', authenticate, opdRoutes);

// Patient Assignment routes - IDOR prevention (ownership tracking)
const patientAssignmentRoutes = require('./patientAssignmentRoutes');
router.use('/assignments', authenticate, patientAssignmentRoutes);

// ========== ADMIN ROUTES (Admin Authentication Required) ==========

// Admin staff management routes - require admin privileges
const staffManagement = require('../Functions/admin/staffManagement');
router.get('/admin/staff', authenticate, requireAdmin, staffManagement.getAllStaff);
router.get('/admin/staff/pending', authenticate, requireAdmin, staffManagement.getPendingStaff);
router.put('/admin/staff/:id/approve', authenticate, requireAdmin, staffManagement.approveStaff);
router.put('/admin/staff/:id/reject', authenticate, requireAdmin, staffManagement.rejectStaff);

// Admin staff registration route (admin can create staff directly)
router.post('/admin/staff', authenticate, requireAdmin, validateStaffData, registerStaff);

// Stats route - require authentication
const getStats = require('../Functions/getStats');
router.get('/stats', authenticate, getStats);

// ========== AUDIT LOG ROUTES (Admin Authentication Required) ==========

const auditLogFunctions = require('../Functions/auditLogFunctions');
router.get('/audit/logs', authenticate, requireAdmin, auditLogFunctions.getAllAuditLogs);
router.get('/audit/user/:userId', authenticate, auditLogFunctions.getUserAuditLogs);
router.get('/audit/patient/:patientId', authenticate, requireAdmin, auditLogFunctions.getPatientAuditLogs);
router.get('/audit/failed-logins', authenticate, requireAdmin, auditLogFunctions.getFailedLoginAttempts);
router.get('/audit/suspicious', authenticate, requireAdmin, auditLogFunctions.getSuspiciousActivity);
router.get('/audit/stats', authenticate, requireAdmin, auditLogFunctions.getAuditStats);

// ========== DEBUG ROUTES (Protected) ==========

// Debug route to check user data - require admin in production
const checkUser = require('../Functions/debug/checkUser');
router.get('/debug/user/:username', authenticate, requireAdmin, checkUser);

// Debug route to reset admin user - require admin
const resetAdmin = require('../Functions/debug/resetAdmin');
router.post('/debug/reset-admin', authenticate, requireAdmin, resetAdmin);

module.exports = router;