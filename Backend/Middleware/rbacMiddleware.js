/**
 * Role-Based Access Control Middleware
 * Restricts access based on user roles/positions
 */

/**
 * Check if user has any of the allowed roles
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // User should be attached by authenticate middleware
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required.',
        error: 'NO_USER_DATA' 
      });
    }

    const userPosition = req.user.position.toLowerCase();
    const hasPermission = allowedRoles.some(role => 
      userPosition.includes(role.toLowerCase())
    );

    if (!hasPermission) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.',
        error: 'FORBIDDEN',
        requiredRoles: allowedRoles,
        userRole: req.user.position
      });
    }

    next();
  };
};

/**
 * Restrict write operations (CREATE, UPDATE, DELETE) to medical staff
 * Doctors and Nurses can perform these operations
 */
const requireMedicalStaff = requireRole('doctor', 'nurse');

/**
 * Restrict admin operations to administrators only
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Authentication required.',
      error: 'NO_USER_DATA' 
    });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({ 
      message: 'Access denied. Admin privileges required.',
      error: 'ADMIN_REQUIRED',
      userRole: req.user.position
    });
  }

  next();
};

/**
 * Check if user can perform write operations on patient records
 * This includes: CREATE, UPDATE, DELETE operations
 */
const canWritePatientRecords = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Authentication required.',
      error: 'NO_USER_DATA' 
    });
  }

  const medicalRoles = ['doctor', 'nurse'];
  const userPosition = req.user.position.toLowerCase();
  const canWrite = medicalRoles.some(role => userPosition.includes(role));

  if (!canWrite) {
    return res.status(403).json({ 
      message: 'Access denied. Only doctors and nurses can modify patient records.',
      error: 'INSUFFICIENT_PERMISSIONS',
      requiredRoles: medicalRoles,
      userRole: req.user.position
    });
  }

  next();
};

/**
 * Check if user can view patient records
 * All authenticated staff can view records
 */
const canViewPatientRecords = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Authentication required.',
      error: 'NO_USER_DATA' 
    });
  }

  // All authenticated staff can view records
  next();
};

/**
 * Operation-specific middleware factory
 * @param {string} operation - 'create', 'read', 'update', or 'delete'
 */
const checkPermission = (operation) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required.',
        error: 'NO_USER_DATA' 
      });
    }

    // Determine if operation requires write permissions
    const writeOperations = ['create', 'update', 'delete', 'post', 'put', 'patch'];
    const requiresWrite = writeOperations.includes(operation.toLowerCase());

    if (requiresWrite) {
      return canWritePatientRecords(req, res, next);
    } else {
      return canViewPatientRecords(req, res, next);
    }
  };
};

/**
 * Attach user permissions to request object for flexible checking
 */
const attachPermissions = (req, res, next) => {
  if (!req.user) {
    req.permissions = {
      canRead: false,
      canWrite: false,
      canDelete: false,
      isAdmin: false
    };
    return next();
  }

  const medicalRoles = ['doctor', 'nurse'];
  const userPosition = req.user.position.toLowerCase();
  const isMedicalStaff = medicalRoles.some(role => userPosition.includes(role));

  req.permissions = {
    canRead: true, // All authenticated users can read
    canWrite: isMedicalStaff,
    canDelete: isMedicalStaff,
    isAdmin: req.user.isAdmin
  };

  next();
};

module.exports = {
  requireRole,
  requireMedicalStaff,
  requireAdmin,
  canWritePatientRecords,
  canViewPatientRecords,
  checkPermission,
  attachPermissions
};
