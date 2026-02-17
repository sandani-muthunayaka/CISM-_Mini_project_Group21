const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patientId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number },
  gender: { type: String },
  address: { type: String },
  contact: { type: String },
  created_at: { type: Date, default: Date.now },
  medicationRecords: [
    {
      medication: String,
      dosage: String,
      comments: String,
      date: String
    }
  ]
});

module.exports = mongoose.models.Patient || mongoose.model('Patient', patientSchema, 'patients');
