const bcrypt = require('bcrypt');
const Staff = require('../../Model/staff');
const { validatePasswordComplexity } = require('../passwordValidator');

async function createInitialAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await Staff.findOne({ 
      position: { $regex: /^admin$/i } 
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      return { success: false, message: 'Admin user already exists' };
    }

    // Create default admin credentials
    const adminData = {
      username: 'admin',
      password: 'Admin@12345', // Secure password meeting complexity requirements
      employee_number: 'ADMIN001',
      position: 'Admin',
      status: 'accepted' // Admin is automatically accepted
    };

    // Validate password complexity
    const passwordValidation = validatePasswordComplexity(adminData.password);
    if (!passwordValidation.isValid) {
      console.error('Admin password does not meet complexity requirements:', passwordValidation.errors);
      return { success: false, message: 'Password must contain at least 12 characters including uppercase, lowercase, number and special character.' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Create admin user
    const adminUser = new Staff({
      username: adminData.username,
      password: hashedPassword,
      employee_number: adminData.employee_number,
      position: adminData.position,
      status: adminData.status,
      isAdmin: true,
      isPasswordTemporary: false,
      failedLoginAttempts: 0,
      accountLockedUntil: null
    });

    await adminUser.save();

    console.log('Initial admin user created successfully');
    console.log('Username: admin');
    console.log('Password: Admin@12345');
    console.log('Please change the password after first login!');

    return { 
      success: true, 
      message: 'Initial admin user created successfully',
      credentials: {
        username: adminData.username,
        password: adminData.password
      }
    };

  } catch (error) {
    console.error('Error creating initial admin:', error);
    return { success: false, message: 'Error creating admin user', error: error.message };
  }
}

// Function to create admin via API call
async function createAdmin(req, res) {
  try {
    const result = await createInitialAdmin();
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error creating admin', 
      error: error.message 
    });
  }
}

module.exports = { createInitialAdmin, createAdmin };