const express = require('express');
const router = express.Router();
const { getHospitalizationHistory, addHospitalizationRecord } = require('../Functions/user/hospitalization');
const { canViewPatientRecords, canWritePatientRecords } = require('../Middleware/rbacMiddleware');
const { validatePatientId, validateHospitalizationData } = require('../Middleware/validationMiddleware');
const { verifyPatientOwnership, verifyWriteAccess } = require('../Middleware/ownershipMiddleware');

// GET hospitalization history - requires ownership verification
router.get('/:patientId/hospitalization', validatePatientId, canViewPatientRecords, verifyPatientOwnership, getHospitalizationHistory);

// POST new hospitalization record - requires write access and ownership verification
router.post('/:patientId/hospitalization', validatePatientId, validateHospitalizationData, canWritePatientRecords, verifyPatientOwnership, verifyWriteAccess, addHospitalizationRecord);

module.exports = router;
