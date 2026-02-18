const express = require('express');
const router = express.Router();
const { getOPDRecords, addOPDRecord } = require('../Functions/user/opd');
const { canViewPatientRecords, canWritePatientRecords } = require('../Middleware/rbacMiddleware');
const { validatePatientId, validateOPDData } = require('../Middleware/validationMiddleware');
const { verifyPatientOwnership, verifyWriteAccess } = require('../Middleware/ownershipMiddleware');

// GET OPD records - requires ownership verification
router.get('/:patientId/opd', validatePatientId, canViewPatientRecords, verifyPatientOwnership, getOPDRecords);

// POST new OPD record - requires write access and ownership verification
router.post('/:patientId/opd', validatePatientId, validateOPDData, canWritePatientRecords, verifyPatientOwnership, verifyWriteAccess, addOPDRecord);

module.exports = router;
