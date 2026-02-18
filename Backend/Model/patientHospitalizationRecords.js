const mongoose = require('mongoose');

const encryptedDataSchema = new mongoose.Schema({
    encryptedData: { type: String, required: true },
    iv: { type: String, required: true },
})

const hospitalizationSchema = new mongoose.Schema({
  patientID: { type: String, required: true },
  date: { type: Date, required: true },
  hospitalName: { type: String, required: true },
  diagnosis: { type: encryptedDataSchema, required: true },
  referral: { type: encryptedDataSchema, required: true },
});

module.exports = mongoose.models.patientHospitalizationRecords || mongoose.model('patientHospitalizationRecords', hospitalizationSchema, 'patientHospitalizationRecords');