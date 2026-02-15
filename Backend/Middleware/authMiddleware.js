/**
 * Authentication Middleware - Verifies JWT token and checks session timeout
 * Usage: Apply this middleware to protected routes
 */

const { verifyToken, checkSessionTimeout, updateLastActivity } = require('../Functions/sessionManager');

/**
 * Middleware to verify JWT token and session validity
 */
async function authMiddleware(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'No token provided. Please log in.',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token signature and expiry
    const tokenResult = verifyToken(token);
    if (!tokenResult.valid) {
      return res.status(401).json({ 
        message: 'Invalid or expired token. Please log in again.',
        code: 'INVALID_TOKEN'
      });
    }

    const { username } = tokenResult.data;

    // Check if session has timed out due to inactivity
    const sessionTimeout = await checkSessionTimeout(username);
    if (sessionTimeout.timedOut) {
      return res.status(401).json({ 
        message: 'Your session has expired due to inactivity. Please log in again.',
        code: 'SESSION_TIMEOUT',
        reason: sessionTimeout.reason
      });
    }

    // Update last activity timestamp
    await updateLastActivity(username);

    // Attach user info to request for use in route handlers
    req.user = tokenResult.data;
    req.user.username = username;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Server error during authentication.',
      code: 'AUTH_ERROR'
    });
  }
}

module.exports = authMiddleware;
