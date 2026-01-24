const Patient = require('../../Model/patient');

// Get hospitalization history for a patient
async function getHospitalizationHistory(req, res) {
  try {
    const patient = await Patient.findOne({ patientId: req.params.patientId });
    if (!patient) return res.status(404).json([]);
    const records = patient.tab2 && Array.isArray(patient.tab2.hospitalizationRecords)
      ? patient.tab2.hospitalizationRecords
      : [];
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Add new hospitalization record for a patient
async function addHospitalizationRecord(req, res) {
  try {
    const { date, ward, diagnosis, followUp } = req.body;
    let patient = await Patient.findOne({ patientId: req.params.patientId });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    if (!patient.tab2) patient.tab2 = {};
    if (!Array.isArray(patient.tab2.hospitalizationRecords)) patient.tab2.hospitalizationRecords = [];
    patient.tab2.hospitalizationRecords.push({ date, ward, diagnosis, followUp });
    await patient.save();
    res.json(patient.tab2.hospitalizationRecords);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getHospitalizationHistory,
  addHospitalizationRecord
};
