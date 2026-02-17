const express = require('express');
const router = express.Router();
const { getMedicationHistory, addMedicationRecord } = require('../Functions/user/medication');
const { canViewPatientRecords, canWritePatientRecords } = require('../Middleware/rbacMiddleware');
const { validatePatientId, validateMedicationData } = require('../Middleware/validationMiddleware');

// GET medication history - all authenticated staff can view
router.get('/:patientId/medication', validatePatientId, canViewPatientRecords, getMedicationHistory);

// POST new medication record - only doctors and nurses can add
router.post('/:patientId/medication', validatePatientId, validateMedicationData, canWritePatientRecords, addMedicationRecord);

module.exports = router;
