const express = require('express');
const router = express.Router();
const authMiddleware = require('../Middleware/authMiddleware');
const { getSessionInfo } = require('../Functions/sessionManager');
const Staff = require('../Model/staff');

/**
 * GET /session/info
 * Get current session information (requires authentication)
 */
router.get('/info', authMiddleware, async (req, res) => {
  try {
    const username = req.user.username;
    const sessionInfo = await getSessionInfo(username);

    if (!sessionInfo) {
      return res.status(404).json({ 
        message: 'Session not found.' 
      });
    }

    res.json({
      message: 'Session info retrieved successfully.',
      session: sessionInfo
    });
  } catch (error) {
    console.error('Error getting session info:', error);
    res.status(500).json({ 
      message: 'Error retrieving session information.' 
    });
  }
});

/**
 * POST /session/logout
 * Logout user and invalidate session (requires authentication)
 */
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const username = req.user.username;

    // Clear session data
    await Staff.findOneAndUpdate(
      { username: username },
      { lastActivityAt: null },
      { new: true }
    );

    res.json({ 
      message: 'Logged out successfully. Session has been terminated.',
      code: 'LOGOUT_SUCCESS'
    });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({ 
      message: 'Error during logout.' 
    });
  }
});

/**
 * POST /session/validate
 * Validate current token and session (requires authentication)
 */
router.post('/validate', authMiddleware, async (req, res) => {
  try {
    const username = req.user.username;
    const sessionInfo = await getSessionInfo(username);

    res.json({
      message: 'Session is valid.',
      valid: true,
      session: sessionInfo,
      user: {
        username: req.user.username,
        employeeNumber: req.user.employeeNumber,
        position: req.user.position,
        isAdmin: req.user.isAdmin
      }
    });
  } catch (error) {
    console.error('Error validating session:', error);
    res.status(500).json({ 
      message: 'Error validating session.' 
    });
  }
});

module.exports = router;
