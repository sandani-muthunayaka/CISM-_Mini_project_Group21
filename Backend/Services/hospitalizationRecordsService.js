const Patient = require('../Model/patientHospitalizationRecords');
const { encrypt, decrypt } = require('../Utils/crypto');

const createPatientHospitalizationRecord = async ({ patientID, date, hospitalName, diagnosis, referral }) => {
    try {
        const encryptedPatientData = {
            patientID,
            date,
            hospitalName,
            diagnosis: encrypt(diagnosis),
            referral: encrypt(referral),
        };
        const newPatient = new Patient(encryptedPatientData);
        await newPatient.save();
        return newPatient;
    } catch (error) {
        throw error;
    }
};

const getAllPatientHospitalizationRecords = async (patientId) => {
    try {
        const patientRecords = await Patient.find({ patientID: patientId });

        console.log(patientRecords);

        return {
            patientRecords: patientRecords.map((record) => ({
                patientID: record.patientID,
                date: record.date,
                hospitalName: record.hospitalName,
                diagnosis: decrypt(record.diagnosis.encryptedData, record.diagnosis.iv),
                referral: decrypt(record.referral.encryptedData, record.referral.iv),
            })),
        };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createPatientHospitalizationRecord,
    getAllPatientHospitalizationRecords,
};