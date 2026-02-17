const AuditLog = require('../Model/auditLog');

/**
 * Get all audit logs with filtering and pagination
 * Admin only
 */
const getAllAuditLogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      userId, 
      action, 
      resourceType, 
      result,
      startDate,
      endDate 
    } = req.query;

    // Build filter query
    const filter = {};
    
    if (userId) filter.userId = userId;
    if (action) filter.action = action;
    if (resourceType) filter.resourceType = resourceType;
    if (result) filter.result = result;
    
    // Date range filter
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [logs, totalCount] = await Promise.all([
      AuditLog.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      AuditLog.countDocuments(filter)
    ]);

    res.json({
      logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve audit logs',
      error: error.message 
    });
  }
};

/**
 * Get audit logs for a specific user
 * Admin can view any user, staff can view their own
 */
const getUserAuditLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    // Check permission: admin can view any, staff can only view their own
    const currentUserId = req.user.id || req.user._id;
    if (!req.user.isAdmin && userId !== currentUserId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied: You can only view your own audit logs' 
      });
    }

    const skip = (page - 1) * limit;

    const [logs, totalCount] = await Promise.all([
      AuditLog.find({ userId })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      AuditLog.countDocuments({ userId })
    ]);

    res.json({
      logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching user audit logs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve user audit logs',
      error: error.message 
    });
  }
};

/**
 * Get audit logs for a specific patient
 * Admin only - tracks who accessed patient records
 */
const getPatientAuditLogs = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const skip = (page - 1) * limit;

    const [logs, totalCount] = await Promise.all([
      AuditLog.find({ resourceId: patientId, resourceType: 'PATIENT' })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      AuditLog.countDocuments({ resourceId: patientId, resourceType: 'PATIENT' })
    ]);

    res.json({
      logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching patient audit logs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve patient audit logs',
      error: error.message 
    });
  }
};

/**
 * Get failed login attempts
 * Admin only - security monitoring
 */
const getFailedLoginAttempts = async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const failedAttempts = await AuditLog.find({
      action: 'LOGIN',
      result: 'FAILED',
      timestamp: { $gte: since }
    })
    .sort({ timestamp: -1 })
    .lean();

    // Group by username to identify potential attacks
    const attemptsByUser = failedAttempts.reduce((acc, attempt) => {
      const username = attempt.username || 'unknown';
      if (!acc[username]) {
        acc[username] = {
          username,
          attempts: 0,
          lastAttempt: attempt.timestamp,
          ipAddresses: new Set()
        };
      }
      acc[username].attempts++;
      if (attempt.ipAddress) {
        acc[username].ipAddresses.add(attempt.ipAddress);
      }
      return acc;
    }, {});

    // Convert to array and sort by attempt count
    const summary = Object.values(attemptsByUser)
      .map(item => ({
        ...item,
        ipAddresses: Array.from(item.ipAddresses)
      }))
      .sort((a, b) => b.attempts - a.attempts);

    res.json({
      totalFailedAttempts: failedAttempts.length,
      timeRange: `Last ${hours} hours`,
      summary,
      recentAttempts: failedAttempts.slice(0, 20)
    });
  } catch (error) {
    console.error('Error fetching failed login attempts:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve failed login attempts',
      error: error.message 
    });
  }
};

/**
 * Get suspicious activity summary
 * Admin only - security monitoring
 */
const getSuspiciousActivity = async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const [deniedAccess, failedLogins, unauthorizedAttempts] = await Promise.all([
      AuditLog.countDocuments({
        action: 'ACCESS_DENIED',
        timestamp: { $gte: since }
      }),
      AuditLog.countDocuments({
        action: 'LOGIN',
        result: 'FAILED',
        timestamp: { $gte: since }
      }),
      AuditLog.countDocuments({
        result: 'DENIED',
        timestamp: { $gte: since }
      })
    ]);

    const recentSuspicious = await AuditLog.find({
      $or: [
        { action: 'ACCESS_DENIED' },
        { result: 'DENIED' },
        { action: 'LOGIN', result: 'FAILED' }
      ],
      timestamp: { $gte: since }
    })
    .sort({ timestamp: -1 })
    .limit(20)
    .lean();

    res.json({
      timeRange: `Last ${hours} hours`,
      summary: {
        deniedAccess,
        failedLogins,
        unauthorizedAttempts,
        total: deniedAccess + failedLogins + unauthorizedAttempts
      },
      recentEvents: recentSuspicious
    });
  } catch (error) {
    console.error('Error fetching suspicious activity:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve suspicious activity',
      error: error.message 
    });
  }
};

/**
 * Get audit statistics
 * Admin only - dashboard metrics
 */
const getAuditStats = async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const stats = await AuditLog.aggregate([
      { $match: { timestamp: { $gte: since } } },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          success: {
            $sum: { $cond: [{ $eq: ['$result', 'SUCCESS'] }, 1, 0] }
          },
          failed: {
            $sum: { $cond: [{ $eq: ['$result', 'FAILED'] }, 1, 0] }
          },
          denied: {
            $sum: { $cond: [{ $eq: ['$result', 'DENIED'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const totalLogs = await AuditLog.countDocuments({ timestamp: { $gte: since } });

    res.json({
      timeRange: `Last ${hours} hours`,
      totalLogs,
      actionStats: stats
    });
  } catch (error) {
    console.error('Error fetching audit stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve audit statistics',
      error: error.message 
    });
  }
};

module.exports = {
  getAllAuditLogs,
  getUserAuditLogs,
  getPatientAuditLogs,
  getFailedLoginAttempts,
  getSuspiciousActivity,
  getAuditStats
};
