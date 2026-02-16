const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Staff = require('../../Model/staff');

// JWT Secret - In production, this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = '24h'; // Token expires in 24 hours

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
      return res.status(401).json({ message: 'Invalid username or password.' });
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

    // Update last login
    staff.lastLoginAt = new Date();
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