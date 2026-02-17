const Staff = require('../../Model/staff');

// Function to reset admin user
async function resetAdmin(req, res) {
  try {
    // Delete existing admin user
    await Staff.deleteOne({ username: 'admin' });
    
    // Create fresh admin user
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('admin', 10);
    
    const adminUser = new Staff({
      username: 'admin',
      password: hashedPassword,
      employee_number: 'ADMIN001',
      position: 'Admin',
      status: 'accepted'
    });
    
    await adminUser.save();
    
    // Verify admin flags
    const isAdmin = ['admin', 'administrator', 'system admin', 'admin user'].includes(adminUser.position.toLowerCase());
    
    res.status(200).json({
      message: 'Admin user reset successfully',
      user: {
        username: adminUser.username,
        position: adminUser.position,
        status: adminUser.status,
        isAdmin: isAdmin
      }
    });
    
  } catch (error) {
    res.status(500).json({ message: 'Error resetting admin', error: error.message });
  }
}

module.exports = resetAdmin;