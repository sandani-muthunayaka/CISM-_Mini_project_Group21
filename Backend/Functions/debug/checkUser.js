const Staff = require('../../Model/staff');

// Debug function to check user data
async function checkUser(req, res) {
  try {
    const { username } = req.params;
    const staff = await Staff.findOne({ username });
    
    if (!staff) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isAdmin = ['admin', 'administrator', 'system admin'].includes(staff.position.toLowerCase());
    
    res.status(200).json({
      username: staff.username,
      position: staff.position,
      positionLower: staff.position.toLowerCase(),
      status: staff.status,
      isAdmin: isAdmin,
      employee_number: staff.employee_number,
      created_at: staff.created_at
    });
    
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

module.exports = checkUser;