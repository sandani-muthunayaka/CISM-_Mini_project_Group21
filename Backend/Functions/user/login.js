const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Staff = require('../../Model/staff');
const { generateToken, updateLastActivity } = require('../sessionManager');

// Account lockout constants
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 5; // Lock account for 5 minutes

// JWT Secret - In production, this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'hospital_system_secret_key_2024';
const JWT_EXPIRES_IN = '24h'; // Token expires in 24 hours

async function loginStaff(req, res) {
  try {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    // NoSQL Injection Prevention: Validate that username and password are strings, not objects
    if (typeof username !== 'string' || typeof password !== 'string') {
      console.warn(`[SECURITY] Type validation failed - username or password is not a string`);
      console.warn(`[SECURITY] Request from IP: ${req.ip}`);
      return res.status(400).json({ 
        message: 'Invalid username or password format.',
        error: 'VALIDATION_ERROR'
      });
    }

    // Find staff by username
    const staff = await Staff.findOne({ username: username.trim() });
    if (!staff) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    // Check if account is locked
    if (staff.accountLockedUntil && new Date() < staff.accountLockedUntil) {
      const remainingMinutes = Math.ceil((staff.accountLockedUntil - new Date()) / 60000);
      return res.status(423).json({ 
        message: `Account is locked due to multiple failed login attempts. Please try again in ${remainingMinutes} minutes.`,
        retryAfter: remainingMinutes
      });
    }

    // Clear lockout if the lockout period has expired
    if (staff.accountLockedUntil && new Date() >= staff.accountLockedUntil) {
      await Staff.updateOne(
        { _id: staff._id },
        { accountLockedUntil: null, failedLoginAttempts: 0 }
      );
      staff.accountLockedUntil = null;
      staff.failedLoginAttempts = 0;
    }

    // Check if staff registration is approved (admins bypass this check)
    const adminPositions = ['admin', 'administrator', 'system admin', 'admin user'];
    const isAdmin = adminPositions.includes(staff.position.toLowerCase());
    
    // Debug logging
    console.log('Login attempt:', {
      username: staff.username,
      position: staff.position,
      positionLower: staff.position.toLowerCase(),
      isAdmin: isAdmin,
      status: staff.status
    });
    
    if (!isAdmin && staff.status !== 'accepted') {
      if (staff.status === 'pending') {
        return res.status(403).json({ message: 'Your registration is pending admin approval. Please wait for approval before logging in.' });
      } else if (staff.status === 'rejected') {
        return res.status(403).json({ message: 'Your registration has been rejected. Please contact the administrator.' });
      } else {
        return res.status(403).json({ message: 'Your account is not active. Please contact the administrator.' });
      }
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) {
      // Increment failed login attempts
      const newFailedAttempts = staff.failedLoginAttempts + 1;
      const updateData = { failedLoginAttempts: newFailedAttempts };

      // Lock account if max attempts reached
      if (newFailedAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockoutTime = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60000);
        updateData.accountLockedUntil = lockoutTime;
        
        await Staff.updateOne({ _id: staff._id }, updateData);
        
        return res.status(423).json({ 
          message: `Invalid username or password. Account locked after ${MAX_LOGIN_ATTEMPTS} failed attempts. Please try again after ${LOCKOUT_DURATION_MINUTES} minutes.`,
          attemptsRemaining: 0
        });
      }

      await Staff.updateOne({ _id: staff._id }, updateData);
      
      const attemptsRemaining = MAX_LOGIN_ATTEMPTS - newFailedAttempts;
      return res.status(401).json({ 
        message: 'Invalid username or password.',
        attemptsRemaining: attemptsRemaining,
        warningMessage: attemptsRemaining > 0 ? `${attemptsRemaining} attempt(s) remaining before account lock` : ''
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: staff._id,
        username: staff.username,
        position: staff.position,
        employeeNumber: staff.employee_number,
        isAdmin: isAdmin
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Update last login and reset session activity
    const now = new Date();
    staff.lastLoginAt = now;
    staff.lastActivityAt = now; // Reset session activity on login
    staff.failedLoginAttempts = 0; // Reset failed attempts on successful login
    await staff.save();

    // Login successful
    res.status(200).json({ 
      message: 'Login successful.',
      token: token, // JWT token for authentication
      expiresIn: JWT_EXPIRES_IN,

      staff: { 
        username: staff.username, 
        position: staff.position, 
        employeeNumber: staff.employee_number,
        isAdmin: isAdmin
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
}

module.exports = loginStaff;