const express = require('express');
const router = express.Router();

const { getOPDRecords, addOPDRecord } = require('../Functions/user/opd');

router.get('/:patientId/opd', getOPDRecords);
router.post('/:patientId/opd', addOPDRecord);

module.exports = router;
