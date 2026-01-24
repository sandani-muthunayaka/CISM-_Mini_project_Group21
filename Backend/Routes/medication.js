const express = require('express');
const router = express.Router();
const { getMedicationHistory, addMedicationRecord } = require('../Functions/user/medication');

router.get('/:patientId/medication', getMedicationHistory);
router.post('/:patientId/medication', addMedicationRecord);

module.exports = router;
