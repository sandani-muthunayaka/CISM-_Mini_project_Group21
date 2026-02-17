const Staff = require('../Model/staff');
const Patient = require('../Model/patient');

// GET /stats
module.exports = async (req, res) => {
  try {
  // Count staff by exact position value
  const doctorCount = await Staff.countDocuments({ position: 'Doctor', status: 'accepted' });
  const nurseCount = await Staff.countDocuments({ position: 'Nurse', status: 'accepted' });
  const pharmacistCount = await Staff.countDocuments({ position: 'Pharmacist', status: 'accepted' });
  const laboratoristCount = await Staff.countDocuments({ position: 'Laboratorist', status: 'accepted' });
    // Count patients
    const patientCount = await Patient.countDocuments({});
    res.json({
      doctors: doctorCount,
      nurses: nurseCount,
      pharmacists: pharmacistCount,
      laboratorists: laboratoristCount,
      patients: patientCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
