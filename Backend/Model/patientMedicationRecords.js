const mongoose = require('mongoose');

const encryptedDataSchema = new mongoose.Schema({
    encryptedData: { type: String, required: true },
    iv: { type: String, required: true },
})

const medicationSchema = new mongoose.Schema({
  patientID: { type: String, required: true },
  date: { type: Date, required: true },
  medication: { type: encryptedDataSchema, required: false },
  dosage: { type: encryptedDataSchema, required: false },
  investigation: { type: encryptedDataSchema, required: false },
});

module.exports = mongoose.models.patientMedicationRecords || mongoose.model('patientMedicationRecords', medicationSchema, 'patientMedicationRecords');