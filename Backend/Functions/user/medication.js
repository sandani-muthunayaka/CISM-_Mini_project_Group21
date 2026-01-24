const Patient = require('../../Model/patient');

// Get medication history for a patient
async function getMedicationHistory(req, res) {
  try {
    const patient = await Patient.findOne({ patientId: req.params.patientId });
    if (!patient) return res.status(404).json([]);
    const meds = patient.tab4 && Array.isArray(patient.tab4.medicationRecords)
      ? patient.tab4.medicationRecords
      : [];
    res.json(meds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Add new medication record for a patient
async function addMedicationRecord(req, res) {
  try {
    const { medication, dosage, comments, date } = req.body;
    console.log('Add Medication Request:', req.body);
    // Ensure tab4 and medicationRecords exist before pushing
    let patient = await Patient.findOne({ patientId: req.params.patientId });
    if (!patient) {
      console.log('Patient not found:', req.params.patientId);
      return res.status(404).json({ error: 'Patient not found' });
    }
    if (!patient.tab4) patient.tab4 = {};
    if (!Array.isArray(patient.tab4.medicationRecords)) patient.tab4.medicationRecords = [];
    patient.tab4.medicationRecords.push({ medication, dosage, comments, date });
    await patient.save();
    console.log('Medication saved for patient:', patient.patientId);
    res.json(patient.tab4.medicationRecords);
  } catch (err) {
    console.error('Error saving medication:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getMedicationHistory,
  addMedicationRecord
};
