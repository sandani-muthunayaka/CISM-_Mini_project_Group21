const API_BASE_URL = 'http://localhost:3000';

export const addMedicationRecord = async (record, patientId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/medication-records/add/${patientId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(record),
        });
        return response.json();
    } catch (error) {
        console.error('Error adding medication record:', error);
        throw error;
    }
};

export const getMedicationRecords = async (patientId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/medication-records/getAll/${patientId}`);
        return response.json().then((data) => data.patientRecords);
    } catch (error) {
        console.error('Error fetching medication records:', error);
        throw error;
    }
};