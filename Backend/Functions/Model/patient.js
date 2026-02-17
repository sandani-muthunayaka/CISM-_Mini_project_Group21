const mongoose = require('mongoose');


const immunizationRecordSchema = new mongoose.Schema({
  vaccineName: String,
  vaccineType: String,
  doseNumber: String,
  dateGiven: String,
  nextDueDate: String,
  batchNumber: String,
  manufacturer: String,
  administeredBy: String,
  site: String,
  route: String,
  adverseReaction: String,
  notes: String,
  status: { type: String, enum: ["Pending", "Completed", "Overdue"], default: "Pending" }
}, { _id: false });


const referralRecordSchema = new mongoose.Schema({
  referredToDoctor: String,
  referredToHospital: String,
  referredToDepartments: [String],
  date: String,
  urgency: String,
  status: String,
  // Add other fields as needed
}, { _id: false });

const patientSchema = new mongoose.Schema({
  patientId: { type: String, required: true, unique: true },
  tab1: Object,
  tab2: {
    hospitalizationRecords: { type: [Object], default: [] },
    opdRecords: { type: [Object], default: [] }
  },
  tab3: Object,
  tab4: {
    immunizationRecords: [immunizationRecordSchema],
    occupationalRecords: { type: [Object], default: [] },
    psychologicalRecords: { type: [Object], default: [] },
    medicationRecords: { type: [Object], default: [] }
  },
  tab5: Object,
  tab6: {
    referralRecords: { type: [referralRecordSchema], default: [] }
  },
});

module.exports = mongoose.models.Patient || mongoose.model('Patient', patientSchema);