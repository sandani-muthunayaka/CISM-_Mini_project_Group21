const Patient = require('../Model/patient');

module.exports = async (req, res) => {
  try {
    let query = {};
    
    // If not admin, filter by assigned patients only (IDOR prevention)
    if (req.canViewAllPatients === false && req.assignedPatientIds) {
      query = { patientId: { $in: req.assignedPatientIds } };
    }
    
    const patients = await Patient.find(query);
    
    if (!patients || patients.length === 0) {
      return res.status(404).json({ 
        error: 'No patients found',
        message: req.canViewAllPatients ? 'No patients in system' : 'You have no assigned patients'
      });
    }
    
    res.json({
      count: patients.length,
      isFiltered: req.canViewAllPatients === false,
      patients: patients
    });
  } catch (err) {
    console.error('Error retrieving patients:', err);
    res.status(500).json({ error: err.message });
  }
};
