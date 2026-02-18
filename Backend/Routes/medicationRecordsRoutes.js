const express = require('express');
const { createMedicationRecord, getAllMedicationRecords } = require('../Controllers/medicationRecordsController');

const router = express.Router();

router.post('/add/:patientId', createMedicationRecord);
router.get('/getAll/:patientId', getAllMedicationRecords);

module.exports = router;