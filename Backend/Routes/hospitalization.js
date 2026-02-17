const express = require('express');
const router = express.Router();
const { getHospitalizationHistory, addHospitalizationRecord } = require('../Functions/user/hospitalization');
const { canViewPatientRecords, canWritePatientRecords } = require('../Middleware/rbacMiddleware');
const { validatePatientId, validateHospitalizationData } = require('../Middleware/validationMiddleware');

// GET hospitalization history - all authenticated staff can view
router.get('/:patientId/hospitalization', validatePatientId, canViewPatientRecords, getHospitalizationHistory);

// POST new hospitalization record - only doctors and nurses can add
router.post('/:patientId/hospitalization', validatePatientId, validateHospitalizationData, canWritePatientRecords, addHospitalizationRecord);

module.exports = router;
