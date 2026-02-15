/**
 * Session Management - Handles JWT tokens and session timeouts
 * Features:
 * - Generate JWT tokens with 5-minute expiry
 * - Track last activity timestamp
 * - Validate session based on inactivity
 * - Auto-logout after 5 minutes of inactivity
 */

const jwt = require('jsonwebtoken');
const Staff = require('../Model/staff');

// Session configuration
const SESSION_CONFIG = {
  TOKEN_EXPIRY: '5m', // Token expires in 5 minutes
  INACTIVITY_TIMEOUT: 5 * 60 * 1000, // 5 minutes in milliseconds
  SECRET_KEY: process.env.JWT_SECRET || 'hospital_system_secret_key_2024' // Change this in production
};

/**
 * Generate JWT token for a user
 */
function generateToken(username, employeeNumber, isAdmin, position) {
  const payload = {
    username: username,
    employeeNumber: employeeNumber,
    isAdmin: isAdmin,
    position: position,
    issuedAt: new Date().toISOString()
  };

  const token = jwt.sign(payload, SESSION_CONFIG.SECRET_KEY, {
    expiresIn: SESSION_CONFIG.TOKEN_EXPIRY
  });

  return token;
}

/**
 * Verify and decode JWT token
 */
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, SESSION_CONFIG.SECRET_KEY);
    return { valid: true, data: decoded };
  } catch (error) {
    return { 
      valid: false, 
      error: error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token' 
    };
  }
}

/**
 * Update user's last activity timestamp in database
 */
async function updateLastActivity(username) {
  try {
    await Staff.findOneAndUpdate(
      { username: username },
      { lastActivityAt: new Date() },
      { new: true }
    );
    return true;
  } catch (error) {
    console.error('Error updating last activity:', error);
    return false;
  }
}

/**
 * Check if session has timed out based on inactivity
 */
async function checkSessionTimeout(username) {
  try {
    const staff = await Staff.findOne({ username: username });
    
    if (!staff) {
      return { timedOut: true, reason: 'User not found' };
    }

    if (!staff.lastActivityAt) {
      // First activity, set it now
      await updateLastActivity(username);
      return { timedOut: false };
    }

    const now = new Date();
    const lastActivity = new Date(staff.lastActivityAt);
    const inactivityDuration = now - lastActivity;

    if (inactivityDuration > SESSION_CONFIG.INACTIVITY_TIMEOUT) {
      return { 
        timedOut: true, 
        reason: 'Session expired due to inactivity',
        inactivityMinutes: Math.floor(inactivityDuration / 60000)
      };
    }

    return { timedOut: false };
  } catch (error) {
    console.error('Error checking session timeout:', error);
    return { timedOut: false, error: error.message };
  }
}

/**
 * Get session info for a user
 */
async function getSessionInfo(username) {
  try {
    const staff = await Staff.findOne({ username: username });
    
    if (!staff) {
      return null;
    }

    const lastActivity = staff.lastActivityAt ? new Date(staff.lastActivityAt) : null;
    const now = new Date();
    let inactivityMinutes = 0;
    let timeRemainingMinutes = 5;

    if (lastActivity) {
      const inactivityDuration = now - lastActivity;
      inactivityMinutes = Math.floor(inactivityDuration / 60000);
      timeRemainingMinutes = Math.max(0, 5 - inactivityMinutes);
    }

    return {
      username: staff.username,
      lastActivityAt: lastActivity,
      inactivityMinutes: inactivityMinutes,
      timeRemainingMinutes: timeRemainingMinutes,
      sessionExpired: timeRemainingMinutes === 0
    };
  } catch (error) {
    console.error('Error getting session info:', error);
    return null;
  }
}

module.exports = {
  generateToken,
  verifyToken,
  updateLastActivity,
  checkSessionTimeout,
  getSessionInfo,
  SESSION_CONFIG
};
