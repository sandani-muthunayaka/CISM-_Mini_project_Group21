const Staff = require('../../Model/staff');

// Get all staff with their status
module.exports.getAllStaff = async function (req, res) {
  try {
    const staffs = await Staff.find({}).sort({ created_at: -1 });
    res.status(200).json(staffs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get only pending staff
module.exports.getPendingStaff = async function (req, res) {
  try {
    const staffs = await Staff.find({ status: 'pending' }).sort({ created_at: -1 });
    res.status(200).json(staffs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approve staff member
module.exports.approveStaff = async function (req, res) {
  const { id } = req.params;
  try {
    await Staff.findByIdAndUpdate(id, { status: 'accepted' });
    res.status(200).json({ message: 'Staff member accepted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reject staff member
module.exports.rejectStaff = async function (req, res) {
  const { id } = req.params;
  try {
    await Staff.findByIdAndUpdate(id, { status: 'rejected' });
    res.status(200).json({ message: 'Staff member rejected successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};