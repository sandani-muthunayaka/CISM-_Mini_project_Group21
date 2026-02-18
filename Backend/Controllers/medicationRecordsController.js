const { createPatientMedicationRecord, getAllPatientMedicationRecords } = require('../Services/medicationRecordsService');

const createMedicationRecord = async (req, res) => {
    try {
        const patientId = req.params.patientId;
        const medicationRecord = req.body;
        const newMedicationRecord = await createPatientMedicationRecord({ patientID: patientId, date: medicationRecord.date, medication: medicationRecord.medication, dosage: medicationRecord.dosage, investigation: medicationRecord.investigation });
        res.status(201).json(newMedicationRecord);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllMedicationRecords = async (req, res) => {
    try {
        const patientId = req.params.patientId;
        const medicationRecords = await getAllPatientMedicationRecords(patientId);
        res.status(200).json(medicationRecords);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = {
    createMedicationRecord,
    getAllMedicationRecords
};