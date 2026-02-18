const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  // User information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'staff',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  userRole: {
    type: String,
    required: true
  },
  
  // Action details
  action: {
    type: String,
    required: true,
    enum: [
      // Authentication actions
      'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT',
      
      // Patient record actions
      'VIEW_PATIENT', 'CREATE_PATIENT', 'UPDATE_PATIENT', 'DELETE_PATIENT',
      'VIEW_PATIENT_LIST', 
      
      // Patient assignment actions
      'ASSIGN_STAFF_TO_PATIENT', 'REMOVE_STAFF_FROM_PATIENT',
      
      // Medical record actions
      'ADD_MEDICATION', 'UPDATE_MEDICATION', 'DELETE_MEDICATION',
      'ADD_HOSPITALIZATION', 'UPDATE_HOSPITALIZATION', 'DELETE_HOSPITALIZATION',
      'ADD_OPD_RECORD', 'UPDATE_OPD_RECORD', 'DELETE_OPD_RECORD',
      
      // Admin actions
      'APPROVE_STAFF', 'REJECT_STAFF', 'CREATE_STAFF', 'UPDATE_STAFF', 'DELETE_STAFF',
      'VIEW_STAFF_LIST', 'RESET_PASSWORD',
      
      // Access control
      'ACCESS_DENIED', 'UNAUTHORIZED_ACCESS_ATTEMPT',
      
      // System actions
      'EXPORT_DATA', 'IMPORT_DATA', 'BACKUP_DATA'
    ]
  },
  
  // Resource details
  resourceType: {
    type: String,
    enum: ['PATIENT', 'STAFF', 'MEDICATION', 'HOSPITALIZATION', 'OPD', 'SYSTEM', 'AUTH'],
    required: true
  },
  resourceId: {
    type: String // Can be ObjectId or 'multiple' for list views
  },
  
  // Result
  result: {
    type: String,
    enum: ['SUCCESS', 'DENIED', 'ERROR'],
    required: true
  },
  
  // Request metadata
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  
  // Additional details
  details: {
    type: mongoose.Schema.Types.Mixed // Flexible object for additional context
  },
  
  // Justification (for sensitive actions)
  justification: {
    type: String
  },
  
  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  strict: true,        // Reject fields not in schema (NoSQL injection prevention)
  strictQuery: true    // Apply strict mode to query filters
});

// Indexes for efficient queries
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1, timestamp: -1 });
auditLogSchema.index({ result: 1, timestamp: -1 });
auditLogSchema.index({ ipAddress: 1, timestamp: -1 });

// Static methods

/**
 * Log an action
 */
auditLogSchema.statics.logAction = async function(data) {
  try {
    const log = new this(data);
    await log.save();
    return log;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging failure shouldn't break the application
    return null;
  }
};

/**
 * Get audit logs with filtering and pagination
 */
auditLogSchema.statics.getAuditLogs = async function(filters = {}, options = {}) {
  const {
    page = 1,
    limit = 50,
    sortBy = 'timestamp',
    sortOrder = 'desc'
  } = options;
  
  const query = {};
  
  // Apply filters
  if (filters.userId) query.userId = filters.userId;
  if (filters.username) query.username = new RegExp(filters.username, 'i');
  if (filters.action) query.action = filters.action;
  if (filters.resourceType) query.resourceType = filters.resourceType;
  if (filters.resourceId) query.resourceId = filters.resourceId;
  if (filters.result) query.result = filters.result;
  if (filters.userRole) query.userRole = filters.userRole;
  
  // Date range filter
  if (filters.startDate || filters.endDate) {
    query.timestamp = {};
    if (filters.startDate) query.timestamp.$gte = new Date(filters.startDate);
    if (filters.endDate) query.timestamp.$lte = new Date(filters.endDate);
  }
  
  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
  
  const [logs, total] = await Promise.all([
    this.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username position')
      .lean(),
    this.countDocuments(query)
  ]);
  
  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get failed login attempts for a user
 */
auditLogSchema.statics.getFailedLoginAttempts = async function(username, timeWindow = 15) {
  const cutoffTime = new Date(Date.now() - timeWindow * 60 * 1000);
  
  return await this.find({
    username: username,
    action: 'LOGIN_FAILED',
    timestamp: { $gte: cutoffTime }
  }).countDocuments();
};

/**
 * Get patient access history
 */
auditLogSchema.statics.getPatientAccessHistory = async function(patientId, limit = 50) {
  return await this.find({
    resourceType: 'PATIENT',
    resourceId: patientId,
    action: { $in: ['VIEW_PATIENT', 'UPDATE_PATIENT', 'CREATE_PATIENT'] }
  })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('userId', 'username position')
    .lean();
};

/**
 * Get suspicious activities (denied access attempts, multiple failures, etc.)
 */
auditLogSchema.statics.getSuspiciousActivities = async function(timeWindow = 24, limit = 100) {
  const cutoffTime = new Date(Date.now() - timeWindow * 60 * 60 * 1000);
  
  return await this.find({
    timestamp: { $gte: cutoffTime },
    $or: [
      { result: 'DENIED' },
      { action: 'UNAUTHORIZED_ACCESS_ATTEMPT' },
      { action: 'LOGIN_FAILED' }
    ]
  })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('userId', 'username position')
    .lean();
};

/**
 * Get user activity summary
 */
auditLogSchema.statics.getUserActivitySummary = async function(userId, days = 30) {
  const cutoffTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return await this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        timestamp: { $gte: cutoffTime }
      }
    },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
