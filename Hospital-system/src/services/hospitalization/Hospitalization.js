const API_BASE_URL = 'http://localhost:3000';

export const addHospitalizationRecord = async (record, patientId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/hospitalization-records/add/${patientId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(record),
        });
        return response.json();
    } catch (error) {
        console.error('Error adding hospitalization record:', error);
        throw error;
    }
};

export const getHospitalizationRecords = async (patientId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/hospitalization-records/getAll/${patientId}`);
        return response.json().then((data) => data.patientRecords);
    } catch (error) {
        console.error('Error fetching hospitalization records:', error);
        throw error;
    }
};