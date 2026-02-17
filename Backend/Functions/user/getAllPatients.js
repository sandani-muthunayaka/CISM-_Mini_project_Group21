const Patient = require('../Model/patient');

module.exports = async (req, res) => {
  try {
    const patients = await Patient.find({});
    
    if (!patients || patients.length === 0) {
      return res.status(404).json({ error: 'No patients found' });
    }
    
    res.json(patients);
  } catch (err) {
    console.error('Error retrieving patients:', err);
    res.status(500).json({ error: err.message });
  }
};
