const express = require('express');
const { createHospitalizationRecord, getAllhospitalizationRecords } = require('../Controllers/hospitalizationRecordsController');

const router = express.Router();

router.post('/add/:patientId', createHospitalizationRecord);
router.get('/getAll/:patientId', getAllhospitalizationRecords);

module.exports = router;