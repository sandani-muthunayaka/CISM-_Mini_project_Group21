const bcrypt = require('bcrypt');
const Staff = require('../../Model/staff');
const { validatePasswordComplexity } = require('../passwordValidator');

async function registerStaff(req, res) {
  try {
  const { username, password, employee_number, position } = req.body;

    // Basic validation
    if (!username || !password || !employee_number || !position) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Validate password complexity
    const passwordValidation = validatePasswordComplexity(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        message: 'Password must contain at least 12 characters including uppercase, lowercase, number and special character.'
      });
    }

    // Check for duplicate username or employee number
    const existingUser = await Staff.findOne({ $or: [{ username }, { employee_number }] });
    if (existingUser) {
      return res.status(409).json({ message: 'Username or Employee Number already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine status - admins are auto-approved
    const adminPositions = ['admin', 'administrator', 'system admin', 'admin user'];
    const isAdmin = adminPositions.includes(position.toLowerCase());
    const status = isAdmin ? 'accepted' : 'pending';

    // Create new staff
    const newStaff = new Staff({
      username,
      password: hashedPassword,
      employee_number,
      position,
      status: status,
      failedLoginAttempts: 0,
      accountLockedUntil: null
    });

    await newStaff.save();

    res.status(201).json({ message: 'Registration successful.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
}

module.exports = registerStaff;