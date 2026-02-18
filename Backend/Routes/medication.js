const express = require('express');
const router = express.Router();
const { getMedicationHistory, addMedicationRecord } = require('../Functions/user/medication');
const { canViewPatientRecords, canWritePatientRecords } = require('../Middleware/rbacMiddleware');
const { validatePatientId, validateMedicationData } = require('../Middleware/validationMiddleware');
const { verifyPatientOwnership, verifyWriteAccess } = require('../Middleware/ownershipMiddleware');

// GET medication history - requires ownership verification
router.get('/:patientId/medication', validatePatientId, canViewPatientRecords, verifyPatientOwnership, getMedicationHistory);

// POST new medication record - requires write access and ownership verification
router.post('/:patientId/medication', validatePatientId, validateMedicationData, canWritePatientRecords, verifyPatientOwnership, verifyWriteAccess, addMedicationRecord);

module.exports = router;
