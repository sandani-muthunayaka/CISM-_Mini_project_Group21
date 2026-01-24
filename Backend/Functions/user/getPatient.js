const Patient = require('../Model/patient');

module.exports = async (req, res) => {
  const { patientId } = req.params;
  
  if (!patientId) {
    return res.status(400).json({ error: 'Patient ID is required' });
  }

  try {
    const patient = await Patient.findOne({ patientId });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    res.json(patient);
  } catch (err) {
    console.error('Error retrieving patient:', err);
    res.status(500).json({ error: err.message });
  }
};
