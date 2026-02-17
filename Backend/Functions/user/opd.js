const Patient = require('../../Model/patient');

// Get OPD records for a patient
async function getOPDRecords(req, res) {
  try {
    const patient = await Patient.findOne({ patientId: req.params.patientId });
    if (!patient) return res.status(404).json([]);
    const records = patient.tab2 && Array.isArray(patient.tab2.opdRecords)
      ? patient.tab2.opdRecords
      : [];
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Add new OPD record for a patient
async function addOPDRecord(req, res) {
  try {
    const { date, symptoms, treatment, investigation } = req.body;
    let patient = await Patient.findOne({ patientId: req.params.patientId });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    if (!patient.tab2) patient.tab2 = {};
    if (!Array.isArray(patient.tab2.opdRecords)) patient.tab2.opdRecords = [];
    patient.tab2.opdRecords.push({ date, symptoms, treatment, investigation });
    await patient.save();
    res.json(patient.tab2.opdRecords);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getOPDRecords,
  addOPDRecord
};
