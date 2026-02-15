const bcrypt = require('bcrypt');
const Staff = require('../../Model/staff');
const { generateToken, updateLastActivity } = require('../sessionManager');

// Account lockout constants
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 5; // Lock account for 5 minutes

async function loginStaff(req, res) {
  try {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    // Find staff by username
    const staff = await Staff.findOne({ username });
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

    // Login successful - reset failed attempts and update last login/activity
    await Staff.updateOne(
      { _id: staff._id },
      { 
        failedLoginAttempts: 0,
        accountLockedUntil: null,
        lastLoginAt: new Date(),
        lastActivityAt: new Date()
      }
    );

    // Generate JWT token for session management
    const token = generateToken(staff.username, staff.employee_number, isAdmin, staff.position);

    // Login successful
    res.status(200).json({ 
      message: 'Login successful.', 
      token: token,
      staff: { 
        username: staff.username, 
        position: staff.position, 
        employeeNumber: staff.employee_number,
        isAdmin: isAdmin
      } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
}

module.exports = loginStaff;