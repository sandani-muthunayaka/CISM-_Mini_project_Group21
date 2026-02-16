const jwt = require('jsonwebtoken');
const Staff = require('../Model/staff');

// JWT Secret - In production, this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user data to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.',
        error: 'UNAUTHORIZED' 
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Token has expired. Please login again.',
          error: 'TOKEN_EXPIRED' 
        });
      }
      return res.status(401).json({ 
        message: 'Invalid token.',
        error: 'INVALID_TOKEN' 
      });
    }

    // Get user from database
    const staff = await Staff.findById(decoded.id);
    
    if (!staff) {
      return res.status(401).json({ 
        message: 'User not found. Token is invalid.',
        error: 'USER_NOT_FOUND' 
      });
    }

    // Check if staff is still active (not rejected)
    const adminPositions = ['admin', 'administrator', 'system admin', 'admin user'];
    const isAdmin = adminPositions.includes(staff.position.toLowerCase());
    
    if (!isAdmin && staff.status !== 'accepted') {
      return res.status(403).json({ 
        message: 'Your account is not active. Please contact the administrator.',
        error: 'ACCOUNT_INACTIVE' 
      });
    }

    // Attach user data to request
    req.user = {
      id: staff._id,
      username: staff.username,
      position: staff.position,
      employeeNumber: staff.employee_number,
      isAdmin: isAdmin,
      status: staff.status
    };

    // Update last login
    staff.lastLoginAt = new Date();
    await staff.save();

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      message: 'Server error during authentication.',
      error: error.message 
    });
  }
};

/**
 * Optional Authentication Middleware
 * Attaches user data if token is present, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    const staff = await Staff.findById(decoded.id);
    
    if (staff) {
      const adminPositions = ['admin', 'administrator', 'system admin', 'admin user'];
      const isAdmin = adminPositions.includes(staff.position.toLowerCase());
      
      req.user = {
        id: staff._id,
        username: staff.username,
        position: staff.position,
        employeeNumber: staff.employee_number,
        isAdmin: isAdmin,
        status: staff.status
      };
    }
    
    next();
  } catch (error) {
    // If there's an error, just continue without user data
    next();
  }
};

module.exports = { authenticate, optionalAuth, JWT_SECRET };
