const mongoose = require('mongoose');

/**
 * Patient Assignment Model
 * Tracks which staff members are assigned to which patients
 * Prevents IDOR by ensuring staff can only access their assigned patients
 */
const patientAssignmentSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    index: true
  },
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true,
    index: true
  },
  staffUsername: {
    type: String,
    required: true
  },
  staffPosition: {
    type: String,
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  assignedByUsername: {
    type: String,
    required: true
  },
  assignmentReason: {
    type: String,
    enum: ['PRIMARY_CARE', 'CONSULTATION', 'EMERGENCY', 'TEMPORARY_COVERAGE', 'SPECIALIST_REFERRAL'],
    default: 'PRIMARY_CARE'
  },
  startDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  endDate: {
    type: Date,
    default: null // null means ongoing assignment
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'COMPLETED', 'REVOKED'],
    default: 'ACTIVE',
    index: true
  },
  accessLevel: {
    type: String,
    enum: ['FULL', 'READ_ONLY', 'LIMITED'],
    default: 'FULL'
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  strict: true,        // Reject fields not in schema (NoSQL injection prevention)
  strictQuery: true    // Apply strict mode to query filters
});

// Compound indexes for efficient queries
patientAssignmentSchema.index({ patientId: 1, staffId: 1, status: 1 });
patientAssignmentSchema.index({ staffId: 1, status: 1 });
patientAssignmentSchema.index({ patientId: 1, status: 1 });

// Update the updatedAt timestamp before saving
patientAssignmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method: Check if staff has access to patient
patientAssignmentSchema.statics.hasAccess = async function(staffId, patientId) {
  const assignment = await this.findOne({
    staffId: staffId,
    patientId: patientId,
    status: 'ACTIVE'
  });
  return assignment !== null;
};

// Static method: Get active assignments for a staff member
patientAssignmentSchema.statics.getStaffAssignments = async function(staffId) {
  return await this.find({
    staffId: staffId,
    status: 'ACTIVE'
  }).sort({ startDate: -1 });
};

// Static method: Get all staff assigned to a patient
patientAssignmentSchema.statics.getPatientCareTeam = async function(patientId) {
  return await this.find({
    patientId: patientId,
    status: 'ACTIVE'
  })
  .populate('staffId', 'username position employee_number')
  .sort({ startDate: -1 });
};

// Static method: Assign staff to patient
patientAssignmentSchema.statics.assignStaff = async function(assignmentData) {
  const assignment = new this(assignmentData);
  await assignment.save();
  return assignment;
};

// Static method: Revoke assignment
patientAssignmentSchema.statics.revokeAssignment = async function(assignmentId) {
  return await this.findByIdAndUpdate(
    assignmentId,
    { 
      status: 'REVOKED',
      endDate: new Date(),
      updatedAt: new Date()
    },
    { new: true }
  );
};

module.exports = mongoose.models.PatientAssignment || 
  mongoose.model('PatientAssignment', patientAssignmentSchema, 'patientAssignments');
