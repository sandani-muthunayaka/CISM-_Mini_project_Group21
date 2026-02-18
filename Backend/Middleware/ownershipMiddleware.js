/**
 * Ownership Verification Middleware
 * Prevents IDOR attacks by verifying staff-patient assignments
 * 
 * CRITICAL SECURITY CONTROL:
 * - Prevents horizontal privilege escalation (staff accessing other staff's patients)
 * - Implements least privilege principle
 * - Enforces care team assignments
 * - Provides admin override for emergencies
 */

const PatientAssignment = require('../Model/patientAssignment');
const AuditLog = require('../Model/auditLog');

/**
 * Verify that the authenticated staff member has an active assignment to the patient
 * Admin users bypass this check for administrative functions
 */
const verifyPatientOwnership = async (req, res, next) => {
  try {
    const patientId = req.params.patientId;
    
    if (!patientId) {
      return res.status(400).json({ 
        message: 'Patient ID is required.',
        error: 'MISSING_PATIENT_ID'
      });
    }

    // Admin override - admins can access any patient record
    if (req.user.isAdmin) {
      console.log(`Admin ${req.user.username} accessing patient ${patientId} - Admin override applied`);
      
      // Log admin access for audit trail
      await AuditLog.logAction({
        userId: req.user.id || req.user._id,
        username: req.user.username,
        userRole: req.user.position,
        action: 'VIEW_PATIENT',
        resourceType: 'PATIENT',
        resourceId: patientId,
        result: 'SUCCESS',
        details: {
          accessType: 'ADMIN_OVERRIDE',
          method: req.method,
          path: req.path
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      return next();
    }

    // Check if staff member has active assignment to this patient
    const staffId = req.user.id || req.user._id;
    const hasAccess = await PatientAssignment.hasAccess(staffId, patientId);

    if (!hasAccess) {
      // Log unauthorized access attempt
      await AuditLog.logAction({
        userId: staffId,
        username: req.user.username,
        userRole: req.user.position,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        resourceType: 'PATIENT',
        resourceId: patientId,
        result: 'DENIED',
        details: {
          reason: 'NO_ACTIVE_ASSIGNMENT',
          method: req.method,
          path: req.path,
          attemptedAction: req.method === 'GET' ? 'VIEW' : 'MODIFY'
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      return res.status(403).json({ 
        message: 'Access denied. You are not assigned to this patient.',
        error: 'NO_PATIENT_ASSIGNMENT',
        patientId: patientId,
        details: 'Staff members can only access patients they are assigned to. Contact an administrator if you need access.'
      });
    }

    // Access granted - log successful access
    await AuditLog.logAction({
      userId: staffId,
      username: req.user.username,
      userRole: req.user.position,
      action: req.method === 'GET' ? 'VIEW_PATIENT' : 'UPDATE_PATIENT',
      resourceType: 'PATIENT',
      resourceId: patientId,
      result: 'SUCCESS',
      details: {
        accessType: 'ASSIGNED_ACCESS',
        method: req.method,
        path: req.path
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    next();
  } catch (error) {
    console.error('Ownership verification error:', error);
    res.status(500).json({ 
      message: 'Error verifying patient access.',
      error: 'OWNERSHIP_CHECK_FAILED'
    });
  }
};

/**
 * Verify ownership for bulk operations (e.g., patient lists)
 * Filters results to only include patients assigned to the staff member
 */
const filterOwnedPatients = async (req, res, next) => {
  try {
    // Admin can see all patients
    if (req.user.isAdmin) {
      req.canViewAllPatients = true;
      return next();
    }

    // Get list of patient IDs this staff member can access
    const staffId = req.user.id || req.user._id;
    const assignments = await PatientAssignment.getStaffAssignments(staffId);
    
    // Extract patient IDs
    req.assignedPatientIds = assignments.map(a => a.patientId);
    req.canViewAllPatients = false;

    next();
  } catch (error) {
    console.error('Filter owned patients error:', error);
    res.status(500).json({ 
      message: 'Error filtering patient list.',
      error: 'FILTER_FAILED'
    });
  }
};

/**
 * Emergency access override
 * Allows temporary access with justification requirement
 * Must be explicitly logged and reviewed
 */
const emergencyAccessOverride = async (req, res, next) => {
  try {
    const { emergencyReason } = req.body;
    const patientId = req.params.patientId;

    if (!emergencyReason || emergencyReason.trim().length < 10) {
      return res.status(400).json({ 
        message: 'Emergency access requires a detailed justification (minimum 10 characters).',
        error: 'INSUFFICIENT_JUSTIFICATION'
      });
    }

    // Log emergency access
    await AuditLog.logAction({
      userId: req.user.id || req.user._id,
      username: req.user.username,
      userRole: req.user.position,
      action: 'VIEW_PATIENT',
      resourceType: 'PATIENT',
      resourceId: patientId,
      result: 'SUCCESS',
      details: {
        accessType: 'EMERGENCY_OVERRIDE',
        method: req.method,
        path: req.path
      },
      justification: emergencyReason,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    console.warn(`EMERGENCY ACCESS: ${req.user.username} accessed patient ${patientId} - Reason: ${emergencyReason}`);

    next();
  } catch (error) {
    console.error('Emergency access error:', error);
    res.status(500).json({ 
      message: 'Error processing emergency access.',
      error: 'EMERGENCY_ACCESS_FAILED'
    });
  }
};

/**
 * Verify write access level
 * Some assignments may be read-only
 */
const verifyWriteAccess = async (req, res, next) => {
  try {
    const patientId = req.params.patientId;
    const staffId = req.user.id || req.user._id;

    // Admin override
    if (req.user.isAdmin) {
      return next();
    }

    // Check assignment access level
    const assignment = await PatientAssignment.findOne({
      staffId: staffId,
      patientId: patientId,
      status: 'ACTIVE'
    });

    if (!assignment) {
      return res.status(403).json({ 
        message: 'Access denied. You are not assigned to this patient.',
        error: 'NO_PATIENT_ASSIGNMENT'
      });
    }

    if (assignment.accessLevel === 'READ_ONLY') {
      await AuditLog.logAction({
        userId: staffId,
        username: req.user.username,
        userRole: req.user.position,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        resourceType: 'PATIENT',
        resourceId: patientId,
        result: 'DENIED',
        details: {
          reason: 'READ_ONLY_ACCESS',
          attemptedAction: 'WRITE',
          method: req.method,
          path: req.path
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      return res.status(403).json({ 
        message: 'Access denied. You have read-only access to this patient.',
        error: 'READ_ONLY_ACCESS',
        accessLevel: assignment.accessLevel
      });
    }

    next();
  } catch (error) {
    console.error('Write access verification error:', error);
    res.status(500).json({ 
      message: 'Error verifying write access.',
      error: 'WRITE_ACCESS_CHECK_FAILED'
    });
  }
};

module.exports = {
  verifyPatientOwnership,
  filterOwnedPatients,
  emergencyAccessOverride,
  verifyWriteAccess
};
