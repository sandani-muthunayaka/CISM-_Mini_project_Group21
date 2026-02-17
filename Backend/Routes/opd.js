const express = require('express');
const router = express.Router();
const { getOPDRecords, addOPDRecord } = require('../Functions/user/opd');
const { canViewPatientRecords, canWritePatientRecords } = require('../Middleware/rbacMiddleware');
const { validatePatientId, validateOPDData } = require('../Middleware/validationMiddleware');

// GET OPD records - all authenticated staff can view
router.get('/:patientId/opd', validatePatientId, canViewPatientRecords, getOPDRecords);

// POST new OPD record - only doctors and nurses can add
router.post('/:patientId/opd', validatePatientId, validateOPDData, canWritePatientRecords, addOPDRecord);

module.exports = router;
