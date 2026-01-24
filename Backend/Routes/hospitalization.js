const express = require('express');
const router = express.Router();

const { getHospitalizationHistory, addHospitalizationRecord } = require('../Functions/user/hospitalization');

router.get('/:patientId/hospitalization', getHospitalizationHistory);
router.post('/:patientId/hospitalization', addHospitalizationRecord);

module.exports = router;
