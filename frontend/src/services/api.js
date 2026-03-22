import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth APIs
export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
};

// Patient APIs (hospital side)
export const patientAPI = {
    getAll: (params) => api.get('/patients', { params }),
    getById: (id) => api.get(`/patients/${id}`),
    create: (data) => api.post('/patients', data),
    update: (id, data) => api.put(`/patients/${id}`, data),
    delete: (id) => api.delete(`/patients/${id}`),
    getStats: () => api.get('/patients/stats/dashboard'),
    getCritical: () => api.get('/patients/stats/critical'),
    getCredentials: (id) => api.get(`/patients/${id}/credentials`),
    resetPassword: (id) => api.post(`/patients/${id}/reset-password`),
    addDisease: (id, data) => api.post(`/patients/${id}/diseases`, data),
    deleteDisease: (id, index) => api.delete(`/patients/${id}/diseases/${index}`),
    addSymptom: (id, data) => api.post(`/patients/${id}/symptoms`, data),
    deleteSymptom: (id, index) => api.delete(`/patients/${id}/symptoms/${index}`),
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
    getCharts: () => api.get('/reports/charts'),
};

// Hospital APIs
export const hospitalAPI = {
    getProfile: () => api.get('/hospital'),
    updateProfile: (data) => api.put('/hospital', data),
};

// Patient Portal APIs (patient side)
export const portalAPI = {
    getDashboard: () => api.get('/portal/dashboard'),
    getReports: () => api.get('/portal/reports'),
    getPendingReports: () => api.get('/portal/pending-reports'),
    getDiseases: () => api.get('/portal/diseases'),
    getSymptoms: () => api.get('/portal/symptoms'),
    getAppointments: () => api.get('/portal/appointments'),
    downloadReport: () => `${API_BASE_URL}/portal/download-report`,
};

export default api;
