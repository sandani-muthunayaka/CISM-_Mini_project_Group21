const express = require('express');
const router = express.Router();
const PatientAssignment = require('../Model/patientAssignment');
const Staff = require('../Model/staff');
const Patient = require('../Model/patient');
const AuditLog = require('../Model/auditLog');
const { requireAdmin, requireMedicalStaff } = require('../Middleware/rbacMiddleware');

/**
 * GET /assignments/my-patients
 * Get all patients assigned to the current staff member
 */
router.get('/my-patients', async (req, res) => {
  try {
    const staffId = req.user.id || req.user._id;
    const assignments = await PatientAssignment.getStaffAssignments(staffId);
    
    // Get full patient details for each assignment
    const patientIds = assignments.map(a => a.patientId);
    const patients = await Patient.find({ patientId: { $in: patientIds } });
    
    // Combine assignment info with patient data
    const result = assignments.map(assignment => {
      const patient = patients.find(p => p.patientId === assignment.patientId);
      return {
        assignment: {
          id: assignment._id,
          reason: assignment.assignmentReason,
          startDate: assignment.startDate,
          accessLevel: assignment.accessLevel,
          status: assignment.status
        },
        patient: patient || { patientId: assignment.patientId, name: 'Unknown' }
      };
    });

    res.json({
      success: true,
      count: result.length,
      assignments: result
    });
  } catch (error) {
    console.error('Error fetching assigned patients:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch assigned patients',
      error: error.message 
    });
  }
});

/**
 * GET /assignments/patient/:patientId/care-team
 * Get all staff members assigned to a patient (care team)
 */
router.get('/patient/:patientId/care-team', async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Only assigned staff or admin can view care team
    if (!req.user.isAdmin) {
      const hasAccess = await PatientAssignment.hasAccess(
        req.user.id || req.user._id, 
        patientId
      );
      
      if (!hasAccess) {
        return res.status(403).json({ 
          success: false,
          message: 'Access denied. You are not assigned to this patient.' 
        });
      }
    }

    const careTeam = await PatientAssignment.getPatientCareTeam(patientId);
    
    res.json({
      success: true,
      patientId: patientId,
      careTeamSize: careTeam.length,
      careTeam: careTeam
    });
  } catch (error) {
    console.error('Error fetching care team:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch care team',
      error: error.message 
    });
  }
});

/**
 * POST /assignments/assign
 * Assign a staff member to a patient
 * Admin or senior medical staff only
 */
router.post('/assign', requireAdmin, async (req, res) => {
  try {
    const { 
      patientId, 
      staffUsername, 
      assignmentReason, 
      accessLevel, 
      notes 
    } = req.body;

    // Validate required fields
    if (!patientId || !staffUsername) {
      return res.status(400).json({ 
        success: false,
        message: 'Patient ID and staff username are required' 
      });
    }

    // Verify patient exists
    const patient = await Patient.findOne({ patientId });
    if (!patient) {
      return res.status(404).json({ 
        success: false,
        message: 'Patient not found' 
      });
    }

    // Verify staff exists
    const staff = await Staff.findOne({ username: staffUsername });
    if (!staff) {
      return res.status(404).json({ 
        success: false,
        message: 'Staff member not found' 
      });
    }

    // Check if assignment already exists
    const existingAssignment = await PatientAssignment.findOne({
      patientId: patientId,
      staffId: staff._id,
      status: 'ACTIVE'
    });

    if (existingAssignment) {
      return res.status(409).json({ 
        success: false,
        message: 'This staff member is already assigned to this patient',
        assignment: existingAssignment
      });
    }

    // Create assignment
    const assignment = await PatientAssignment.assignStaff({
      patientId: patientId,
      staffId: staff._id,
      staffUsername: staff.username,
      staffPosition: staff.position,
      assignedBy: req.user.id || req.user._id,
      assignedByUsername: req.user.username,
      assignmentReason: assignmentReason || 'PRIMARY_CARE',
      accessLevel: accessLevel || 'FULL',
      notes: notes
    });

    // Log assignment action
    await AuditLog.logAction({
      userId: req.user.id || req.user._id,
      username: req.user.username,
      userRole: req.user.position,
      action: 'ASSIGN_STAFF_TO_PATIENT',
      resourceType: 'PATIENT',
      resourceId: patientId,
      result: 'SUCCESS',
      details: {
        assignedStaffId: staff._id,
        assignedStaffUsername: staff.username,
        assignmentReason: assignment.assignmentReason,
        accessLevel: assignment.accessLevel
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json({
      success: true,
      message: 'Staff assigned to patient successfully',
      assignment: assignment
    });
  } catch (error) {
    console.error('Error assigning staff to patient:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to assign staff to patient',
      error: error.message 
    });
  }
});

/**
 * DELETE /assignments/:assignmentId
 * Revoke a staff assignment
 * Admin only
 */
router.delete('/:assignmentId', requireAdmin, async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { reason } = req.body;

    const assignment = await PatientAssignment.findById(assignmentId);
    
    if (!assignment) {
      return res.status(404).json({ 
        success: false,
        message: 'Assignment not found' 
      });
    }

    if (assignment.status !== 'ACTIVE') {
      return res.status(400).json({ 
        success: false,
        message: 'Assignment is not active' 
      });
    }

    // Revoke assignment
    const revokedAssignment = await PatientAssignment.revokeAssignment(assignmentId);

    // Log revocation
    await AuditLog.logAction({
      userId: req.user.id || req.user._id,
      username: req.user.username,
      userRole: req.user.position,
      action: 'REMOVE_STAFF_FROM_PATIENT',
      resourceType: 'PATIENT',
      resourceId: assignment.patientId,
      result: 'SUCCESS',
      details: {
        revokedStaffId: assignment.staffId,
        revokedStaffUsername: assignment.staffUsername,
        reason: reason || 'Not specified'
      },
      justification: reason,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({
      success: true,
      message: 'Assignment revoked successfully',
      assignment: revokedAssignment
    });
  } catch (error) {
    console.error('Error revoking assignment:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to revoke assignment',
      error: error.message 
    });
  }
});

/**
 * GET /assignments/stats
 * Get assignment statistics
 * Admin only
 */
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const [
      totalActive,
      totalCompleted,
      totalRevoked,
      assignmentsByReason
    ] = await Promise.all([
      PatientAssignment.countDocuments({ status: 'ACTIVE' }),
      PatientAssignment.countDocuments({ status: 'COMPLETED' }),
      PatientAssignment.countDocuments({ status: 'REVOKED' }),
      PatientAssignment.aggregate([
        { $match: { status: 'ACTIVE' } },
        { $group: { _id: '$assignmentReason', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        totalActive,
        totalCompleted,
        totalRevoked,
        byReason: assignmentsByReason
      }
    });
  } catch (error) {
    console.error('Error fetching assignment stats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch assignment statistics',
      error: error.message 
    });
  }
});

/**
 * POST /assignments/emergency-access
 * Request emergency access to a patient with justification
 * Creates temporary assignment with audit trail
 */
router.post('/emergency-access', requireMedicalStaff, async (req, res) => {
  try {
    const { patientId, emergencyReason } = req.body;

    if (!patientId || !emergencyReason) {
      return res.status(400).json({ 
        success: false,
        message: 'Patient ID and emergency reason are required' 
      });
    }

    if (emergencyReason.trim().length < 20) {
      return res.status(400).json({ 
        success: false,
        message: 'Emergency reason must be at least 20 characters and provide clear justification' 
      });
    }

    // Verify patient exists
    const patient = await Patient.findOne({ patientId });
    if (!patient) {
      return res.status(404).json({ 
        success: false,
        message: 'Patient not found' 
      });
    }

    const staffId = req.user.id || req.user._id;

    // Check if already assigned
    const existingAssignment = await PatientAssignment.findOne({
      patientId: patientId,
      staffId: staffId,
      status: 'ACTIVE'
    });

    if (existingAssignment) {
      return res.status(409).json({ 
        success: false,
        message: 'You already have access to this patient' 
      });
    }

    // Create emergency assignment (expires in 24 hours)
    const emergencyEndDate = new Date();
    emergencyEndDate.setHours(emergencyEndDate.getHours() + 24);

    const assignment = await PatientAssignment.assignStaff({
      patientId: patientId,
      staffId: staffId,
      staffUsername: req.user.username,
      staffPosition: req.user.position,
      assignedBy: staffId, // Self-assigned
      assignedByUsername: req.user.username,
      assignmentReason: 'EMERGENCY',
      accessLevel: 'FULL',
      endDate: emergencyEndDate,
      notes: `EMERGENCY ACCESS: ${emergencyReason}`
    });

    // Log emergency access with high priority
    await AuditLog.logAction({
      userId: staffId,
      username: req.user.username,
      userRole: req.user.position,
      action: 'ASSIGN_STAFF_TO_PATIENT',
      resourceType: 'PATIENT',
      resourceId: patientId,
      result: 'SUCCESS',
      details: {
        accessType: 'EMERGENCY',
        expiresAt: emergencyEndDate,
        autoRevoke: true
      },
      justification: emergencyReason,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    console.warn(`EMERGENCY ACCESS GRANTED: ${req.user.username} to patient ${patientId} - ${emergencyReason}`);

    res.status(201).json({
      success: true,
      message: 'Emergency access granted. This assignment will expire in 24 hours.',
      assignment: assignment,
      expiresAt: emergencyEndDate,
      warning: 'This emergency access has been logged and will be reviewed by administrators.'
    });
  } catch (error) {
    console.error('Error granting emergency access:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to grant emergency access',
      error: error.message 
    });
  }
});

module.exports = router;
