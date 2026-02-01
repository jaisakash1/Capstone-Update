import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientAPI } from '../services/api';

function NewPatient() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({
        name: '',
        gender: 'Male',
        age: '',
        phone: '',
        timeInHospital: '',
        emergencyVisits: 0,
        inpatientVisits: 0,
        hba1c: 'Pending',
        glucose: 'Pending',
        bloodPressure: { systolic: '', diastolic: '' },
        sugarLevel: '',
        diabetesMed: 'Yes'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'systolic' || name === 'diastolic') {
            setFormData(prev => ({
                ...prev,
                bloodPressure: { ...prev.bloodPressure, [name]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await patientAPI.create({
                ...formData,
                age: parseInt(formData.age),
                timeInHospital: parseInt(formData.timeInHospital),
                emergencyVisits: parseInt(formData.emergencyVisits),
                inpatientVisits: parseInt(formData.inpatientVisits),
                sugarLevel: formData.sugarLevel ? parseFloat(formData.sugarLevel) : undefined,
                bloodPressure: {
                    systolic: formData.bloodPressure.systolic ? parseInt(formData.bloodPressure.systolic) : undefined,
                    diastolic: formData.bloodPressure.diastolic ? parseInt(formData.bloodPressure.diastolic) : undefined
                }
            });

            const patient = response.data;

            if (patient.isEligible) {
                setMessage({
                    type: 'success',
                    text: `✅ Patient "${patient.name}" saved successfully! Eligible for the program.`
                });
            } else {
                setMessage({
                    type: 'warning',
                    text: `⚠️ Patient saved but NOT eligible: ${patient.eliminationReason}`
                });
            }

            // Reset form
            setFormData({
                name: '',
                gender: 'Male',
                age: '',
                phone: '',
                timeInHospital: '',
                emergencyVisits: 0,
                inpatientVisits: 0,
                hba1c: 'Pending',
                glucose: 'Pending',
                bloodPressure: { systolic: '', diastolic: '' },
                sugarLevel: '',
                diabetesMed: 'Yes'
            });

            setTimeout(() => navigate('/patients'), 2000);
        } catch (error) {
            setMessage({
                type: 'danger',
                text: `❌ Error: ${error.response?.data?.error || error.message}`
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">New Patient Registration</h1>
                <p className="page-subtitle">Register a new diabetic patient for follow-up program</p>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <h3 style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>👤 Basic Information</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Patient Name *</label>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter full name"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Gender *</label>
                            <select
                                name="gender"
                                className="form-select"
                                value={formData.gender}
                                onChange={handleChange}
                                required
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Age *</label>
                            <input
                                type="number"
                                name="age"
                                className="form-input"
                                value={formData.age}
                                onChange={handleChange}
                                placeholder="Enter age"
                                min="0"
                                max="150"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                className="form-input"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Enter phone number"
                            />
                        </div>
                    </div>

                    <h3 style={{ marginBottom: '20px', marginTop: '32px', color: 'var(--text-secondary)' }}>🏥 Hospital Visit Details</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Days in Hospital *</label>
                            <input
                                type="number"
                                name="timeInHospital"
                                className="form-input"
                                value={formData.timeInHospital}
                                onChange={handleChange}
                                placeholder="Number of days"
                                min="0"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Emergency Visits</label>
                            <input
                                type="number"
                                name="emergencyVisits"
                                className="form-input"
                                value={formData.emergencyVisits}
                                onChange={handleChange}
                                placeholder="Number of emergency visits"
                                min="0"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Inpatient Visits</label>
                            <input
                                type="number"
                                name="inpatientVisits"
                                className="form-input"
                                value={formData.inpatientVisits}
                                onChange={handleChange}
                                placeholder="Number of inpatient visits"
                                min="0"
                            />
                        </div>
                    </div>

                    <h3 style={{ marginBottom: '20px', marginTop: '32px', color: 'var(--text-secondary)' }}>🧪 Lab Reports</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">HbA1c Result</label>
                            <select
                                name="hba1c"
                                className="form-select"
                                value={formData.hba1c}
                                onChange={handleChange}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Normal">Normal</option>
                                <option value="Abnormal">Abnormal</option>
                                <option value="Unknown">Unknown</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Glucose Result</label>
                            <select
                                name="glucose"
                                className="form-select"
                                value={formData.glucose}
                                onChange={handleChange}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Normal">Normal</option>
                                <option value="Abnormal">Abnormal</option>
                                <option value="Unknown">Unknown</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Blood Pressure (Systolic)</label>
                            <input
                                type="number"
                                name="systolic"
                                className="form-input"
                                value={formData.bloodPressure.systolic}
                                onChange={handleChange}
                                placeholder="e.g., 120"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Blood Pressure (Diastolic)</label>
                            <input
                                type="number"
                                name="diastolic"
                                className="form-input"
                                value={formData.bloodPressure.diastolic}
                                onChange={handleChange}
                                placeholder="e.g., 80"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Sugar Level (mg/dL)</label>
                            <input
                                type="number"
                                name="sugarLevel"
                                className="form-input"
                                value={formData.sugarLevel}
                                onChange={handleChange}
                                placeholder="e.g., 140"
                            />
                        </div>
                    </div>

                    <h3 style={{ marginBottom: '20px', marginTop: '32px', color: 'var(--text-secondary)' }}>💊 Medication</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">On Diabetes Medication? *</label>
                            <select
                                name="diabetesMed"
                                className="form-select"
                                value={formData.diabetesMed}
                                onChange={handleChange}
                                required
                            >
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : '💾 Save Patient'}
                        </button>
                        <button type="button" className="btn btn-outline" onClick={() => navigate('/patients')}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default NewPatient;
