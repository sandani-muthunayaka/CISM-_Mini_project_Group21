const Patient = require('../Model/patientMedicationRecords');
const { encrypt, decrypt } = require('../Utils/crypto');

const createPatientMedicationRecord = async ({ patientID, date, medication, dosage, investigation }) => {
    try {
        const encryptedPatientData = {
            patientID,
            date,
            medication: encrypt(medication),
            dosage: encrypt(dosage),
            investigation: encrypt(investigation),
        };
        const newPatient = new Patient(encryptedPatientData);
        await newPatient.save();
        return newPatient;
    } catch (error) {
        throw error;
    }
};

const getAllPatientMedicationRecords = async (patientId) => {
    try {
        const patientRecords = await Patient.find({ patientID: patientId });

        console.log(patientRecords);

        return {
            patientRecords: patientRecords.map((record) => ({
                patientID: record.patientID,
                date: record.date,
                medication: decrypt(record.medication.encryptedData, record.medication.iv),
                dosage: decrypt(record.dosage.encryptedData, record.dosage.iv),
                investigation: decrypt(record.investigation.encryptedData, record.investigation.iv),
            })),
        };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createPatientMedicationRecord,
    getAllPatientMedicationRecords,
};