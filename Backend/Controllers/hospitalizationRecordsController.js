const { createPatientHospitalizationRecord, getAllPatientHospitalizationRecords } = require('../Services/hospitalizationRecordsService');

const createHospitalizationRecord = async (req, res) => {
    try {
        const patientId = req.params.patientId;
        const hospitalizationRecord = req.body;
        const newhospitalizationRecord = await createPatientHospitalizationRecord({ patientID: patientId, date: hospitalizationRecord.date, hospitalName: hospitalizationRecord.hospitalName, diagnosis: hospitalizationRecord.diagnosis, referral: hospitalizationRecord.referral });
        res.status(201).json(newhospitalizationRecord);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllhospitalizationRecords = async (req, res) => {
    try {
        const patientId = req.params.patientId;
        const hospitalizationRecords = await getAllPatientHospitalizationRecords(patientId);
        res.status(200).json(hospitalizationRecords);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = {
    createHospitalizationRecord,
    getAllhospitalizationRecords
};