import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Patient APIs
export const patientAPI = {
    getAll: (params) => api.get('/patients', { params }),
    getById: (id) => api.get(`/patients/${id}`),
    create: (data) => api.post('/patients', data),
    update: (id, data) => api.put(`/patients/${id}`, data),
    delete: (id) => api.delete(`/patients/${id}`),
    getStats: () => api.get('/patients/stats/dashboard'),
};

// Readmission APIs
export const readmissionAPI = {
    getAll: () => api.get('/readmissions'),
    getByPatient: (patientId) => api.get(`/readmissions/patient/${patientId}`),
    create: (data) => api.post('/readmissions', data),
    update: (id, data) => api.put(`/readmissions/${id}`, data),
    delete: (id) => api.delete(`/readmissions/${id}`),
};

// Follow-up APIs
export const followUpAPI = {
    getAll: (params) => api.get('/followups', { params }),
    getByPatient: (patientId) => api.get(`/followups/patient/${patientId}`),
    create: (data) => api.post('/followups', data),
    complete: (id, data) => api.put(`/followups/${id}/complete`, data),
    update: (id, data) => api.put(`/followups/${id}`, data),
    delete: (id) => api.delete(`/followups/${id}`),
};

// Report APIs
export const reportAPI = {
    getPatientReport: (patientId) => {
        return `${API_BASE_URL}/reports/patient/${patientId}`;
    },
    getSummary: () => api.get('/reports/summary'),
};

export default api;
