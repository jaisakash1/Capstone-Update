import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientAPI } from '../services/api';

function PatientDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [credentials, setCredentials] = useState(null);
    const [activeTab, setActiveTab] = useState('info');

    // Edit form states
    const [editData, setEditData] = useState({});
    const [newDisease, setNewDisease] = useState({ name: '', status: 'Active', notes: '' });
    const [newSymptom, setNewSymptom] = useState({ name: '', severity: 'Mild', notes: '' });

    useEffect(() => {
        fetchPatient();
    }, [id]);

    const fetchPatient = async () => {
        try {
            const res = await patientAPI.getById(id);
            setPatient(res.data);
            setEditData({
                name: res.data.name || '',
                age: res.data.age || '',
                gender: res.data.gender || 'Male',
                phone: res.data.phone || '',
                email: res.data.email || '',
                timeInHospital: res.data.timeInHospital || 0,
                emergencyVisits: res.data.emergencyVisits || 0,
                inpatientVisits: res.data.inpatientVisits || 0,
                hba1c: res.data.hba1c || 'Pending',
                glucose: res.data.glucose || 'Pending',
                diabetesMed: res.data.diabetesMed || 'Yes',
                sugarLevel: res.data.sugarLevel || '',
                bloodPressure: {
                    systolic: res.data.bloodPressure?.systolic || '',
                    diastolic: res.data.bloodPressure?.diastolic || ''
                }
            });
        } catch (err) {
            setMessage({ type: 'danger', text: 'Failed to load patient data.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'systolic' || name === 'diastolic') {
            setEditData(prev => ({
                ...prev,
                bloodPressure: { ...prev.bloodPressure, [name]: value }
            }));
        } else {
            setEditData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await patientAPI.update(id, {
                ...editData,
                age: parseInt(editData.age),
                timeInHospital: parseInt(editData.timeInHospital),
                emergencyVisits: parseInt(editData.emergencyVisits),
                inpatientVisits: parseInt(editData.inpatientVisits),
                sugarLevel: editData.sugarLevel ? parseFloat(editData.sugarLevel) : undefined,
                bloodPressure: {
                    systolic: editData.bloodPressure.systolic ? parseInt(editData.bloodPressure.systolic) : undefined,
                    diastolic: editData.bloodPressure.diastolic ? parseInt(editData.bloodPressure.diastolic) : undefined
                }
            });
            setPatient(res.data);
            setMessage({ type: 'success', text: '✅ Patient updated successfully!' });
        } catch (err) {
            setMessage({ type: 'danger', text: `❌ Error: ${err.response?.data?.error || err.message}` });
        } finally {
            setSaving(false);
        }
    };

    const viewCredentials = async () => {
        try {
            const res = await patientAPI.getCredentials(id);
            setCredentials(res.data);
        } catch (err) {
            setMessage({ type: 'danger', text: 'Failed to fetch credentials.' });
        }
    };

    const copyCredentials = () => {
        if (credentials) {
            const text = `Patient ID: ${credentials.patientId}\nPassword: ${credentials.password}`;
            navigator.clipboard.writeText(text);
            alert('Credentials copied!');
        }
    };

    const resetPassword = async () => {
        if (!window.confirm('Generate a new password for this patient? The old password will stop working.')) return;
        try {
            const res = await patientAPI.resetPassword(id);
            setCredentials(res.data.credentials);
            setMessage({ type: 'success', text: '✅ Password reset successfully! New credentials shown below.' });
        } catch (err) {
            setMessage({ type: 'danger', text: `❌ Failed to reset password: ${err.response?.data?.error || err.message}` });
        }
    };

    const addDisease = async () => {
        if (!newDisease.name) return;
        try {
            await patientAPI.addDisease(id, newDisease);
            setNewDisease({ name: '', status: 'Active', notes: '' });
            fetchPatient();
            setMessage({ type: 'success', text: '✅ Disease added.' });
        } catch (err) {
            setMessage({ type: 'danger', text: 'Failed to add disease.' });
        }
    };

    const deleteDisease = async (index) => {
        try {
            await patientAPI.deleteDisease(id, index);
            fetchPatient();
        } catch (err) {
            setMessage({ type: 'danger', text: 'Failed to delete disease.' });
        }
    };

    const addSymptom = async () => {
        if (!newSymptom.name) return;
        try {
            await patientAPI.addSymptom(id, newSymptom);
            setNewSymptom({ name: '', severity: 'Mild', notes: '' });
            fetchPatient();
            setMessage({ type: 'success', text: '✅ Symptom added.' });
        } catch (err) {
            setMessage({ type: 'danger', text: 'Failed to add symptom.' });
        }
    };

    const deleteSymptom = async (index) => {
        try {
            await patientAPI.deleteSymptom(id, index);
            fetchPatient();
        } catch (err) {
            setMessage({ type: 'danger', text: 'Failed to delete symptom.' });
        }
    };

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    if (!patient) {
        return <div className="empty-state"><h3>Patient not found</h3></div>;
    }

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 className="page-title">{patient.name}</h1>
                    <p className="page-subtitle">
                        ID: <span style={{ fontFamily: 'Courier New', color: 'var(--accent-primary)' }}>{patient.patientId}</span>
                        &nbsp;•&nbsp;{patient.gender}, {patient.age} yrs
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-outline" onClick={viewCredentials}>🔐 View Credentials</button>
                    <button className="btn btn-outline" onClick={() => navigate('/patients')}>← Back to List</button>
                </div>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type}`} style={{ marginBottom: '16px' }}>{message.text}</div>
            )}

            {/* Credentials Modal */}
            {credentials && (
                <div className="modal-overlay" onClick={() => setCredentials(null)}>
                    <div className="modal credentials-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h2>🔐 Patient Credentials</h2></div>
                        <div className="credentials-content">
                            <div className="credential-field">
                                <label>Patient Name</label>
                                <div className="credential-value" style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{credentials.name}</div>
                            </div>
                            <div className="credential-field">
                                <label>Patient ID</label>
                                <div className="credential-value">{credentials.patientId}</div>
                            </div>
                            <div className="credential-field">
                                <label>Password</label>
                                <div className="credential-value">{credentials.password}</div>
                            </div>
                            {credentials.email && (
                                <div className="credential-field">
                                    <label>Email</label>
                                    <div className="credential-value" style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{credentials.email}</div>
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
                            <button className="btn btn-primary" onClick={copyCredentials}>📋 Copy</button>
                            <button className="btn btn-warning" onClick={resetPassword} style={{ background: 'var(--accent-warning)', color: '#000' }}>🔄 Reset Password</button>
                            <button className="btn btn-outline" onClick={() => setCredentials(null)}>✓ Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="tabs" style={{ marginBottom: '24px' }}>
                {['info', 'vitals', 'diseases', 'symptoms'].map(tab => (
                    <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}>
                        {tab === 'info' ? '👤 Info' : tab === 'vitals' ? '🩺 Vitals & Labs' : tab === 'diseases' ? '🦠 Diseases' : '🌡️ Symptoms'}
                    </button>
                ))}
            </div>

            {/* Info Tab */}
            {activeTab === 'info' && (
                <div className="card">
                    <h3 style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>👤 Patient Information</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Name</label>
                            <input type="text" name="name" className="form-input" value={editData.name} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Age</label>
                            <input type="number" name="age" className="form-input" value={editData.age} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Gender</label>
                            <select name="gender" className="form-select" value={editData.gender} onChange={handleChange}>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone</label>
                            <input type="tel" name="phone" className="form-input" value={editData.phone} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input type="email" name="email" className="form-input" value={editData.email} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Days in Hospital</label>
                            <input type="number" name="timeInHospital" className="form-input" value={editData.timeInHospital} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Emergency Visits</label>
                            <input type="number" name="emergencyVisits" className="form-input" value={editData.emergencyVisits} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Diabetes Medication</label>
                            <select name="diabetesMed" className="form-select" value={editData.diabetesMed} onChange={handleChange}>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ marginTop: '24px' }}>
                        {saving ? 'Saving...' : '💾 Save Changes'}
                    </button>
                </div>
            )}

            {/* Vitals & Labs Tab */}
            {activeTab === 'vitals' && (
                <div className="card">
                    <h3 style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>🩺 Vitals & Lab Results</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Blood Pressure (Systolic)</label>
                            <input type="number" name="systolic" className="form-input" value={editData.bloodPressure.systolic} onChange={handleChange} placeholder="e.g., 120" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Blood Pressure (Diastolic)</label>
                            <input type="number" name="diastolic" className="form-input" value={editData.bloodPressure.diastolic} onChange={handleChange} placeholder="e.g., 80" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Sugar Level (mg/dL)</label>
                            <input type="number" name="sugarLevel" className="form-input" value={editData.sugarLevel} onChange={handleChange} placeholder="e.g., 140" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">HbA1c Result</label>
                            <select name="hba1c" className="form-select" value={editData.hba1c} onChange={handleChange}>
                                <option value="Pending">Pending</option>
                                <option value="Normal">Normal</option>
                                <option value="Abnormal">Abnormal</option>
                                <option value="Unknown">Unknown</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Glucose Result</label>
                            <select name="glucose" className="form-select" value={editData.glucose} onChange={handleChange}>
                                <option value="Pending">Pending</option>
                                <option value="Normal">Normal</option>
                                <option value="Abnormal">Abnormal</option>
                                <option value="Unknown">Unknown</option>
                            </select>
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ marginTop: '24px' }}>
                        {saving ? 'Saving...' : '💾 Save Changes'}
                    </button>
                </div>
            )}

            {/* Diseases Tab */}
            {activeTab === 'diseases' && (
                <div>
                    <div className="card" style={{ marginBottom: '24px' }}>
                        <h3 style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>➕ Add Disease</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Disease Name *</label>
                                <input type="text" className="form-input" value={newDisease.name}
                                    onChange={e => setNewDisease({ ...newDisease, name: e.target.value })} placeholder="e.g., Type 2 Diabetes" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select className="form-select" value={newDisease.status}
                                    onChange={e => setNewDisease({ ...newDisease, status: e.target.value })}>
                                    <option value="Active">Active</option>
                                    <option value="Managed">Managed</option>
                                    <option value="Resolved">Resolved</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Notes</label>
                                <input type="text" className="form-input" value={newDisease.notes}
                                    onChange={e => setNewDisease({ ...newDisease, notes: e.target.value })} placeholder="Additional notes" />
                            </div>
                        </div>
                        <button className="btn btn-primary" onClick={addDisease} style={{ marginTop: '16px' }}>➕ Add Disease</button>
                    </div>

                    <div className="card">
                        <h3 style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>🦠 Current Diseases ({patient.diseases?.length || 0})</h3>
                        {(!patient.diseases || patient.diseases.length === 0) ? (
                            <p style={{ color: 'var(--text-muted)' }}>No diseases recorded.</p>
                        ) : (
                            <div className="diseases-grid">
                                {patient.diseases.map((d, i) => (
                                    <div key={i} className="card" style={{ border: '1px solid var(--border-color)' }}>
                                        <div className="card-header">
                                            <h2 className="card-title">{d.name}</h2>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <span className={`badge ${d.status === 'Active' ? 'badge-danger' : d.status === 'Managed' ? 'badge-warning' : 'badge-success'}`}>{d.status}</span>
                                                <button className="btn btn-sm btn-danger" onClick={() => deleteDisease(i)}>🗑️</button>
                                            </div>
                                        </div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            Diagnosed: {new Date(d.diagnosedDate).toLocaleDateString('en-IN')}
                                        </p>
                                        {d.notes && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>{d.notes}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Symptoms Tab */}
            {activeTab === 'symptoms' && (
                <div>
                    <div className="card" style={{ marginBottom: '24px' }}>
                        <h3 style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>➕ Add Symptom</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Symptom Name *</label>
                                <input type="text" className="form-input" value={newSymptom.name}
                                    onChange={e => setNewSymptom({ ...newSymptom, name: e.target.value })} placeholder="e.g., Frequent Urination" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Severity</label>
                                <select className="form-select" value={newSymptom.severity}
                                    onChange={e => setNewSymptom({ ...newSymptom, severity: e.target.value })}>
                                    <option value="Mild">Mild</option>
                                    <option value="Moderate">Moderate</option>
                                    <option value="Severe">Severe</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Notes</label>
                                <input type="text" className="form-input" value={newSymptom.notes}
                                    onChange={e => setNewSymptom({ ...newSymptom, notes: e.target.value })} placeholder="Additional notes" />
                            </div>
                        </div>
                        <button className="btn btn-primary" onClick={addSymptom} style={{ marginTop: '16px' }}>➕ Add Symptom</button>
                    </div>

                    <div className="card">
                        <h3 style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>🌡️ Current Symptoms ({patient.symptoms?.length || 0})</h3>
                        {(!patient.symptoms || patient.symptoms.length === 0) ? (
                            <p style={{ color: 'var(--text-muted)' }}>No symptoms recorded.</p>
                        ) : (
                            patient.symptoms.map((s, i) => (
                                <div key={i} className="card" style={{ marginBottom: '12px', border: '1px solid var(--border-color)' }}>
                                    <div className="card-header">
                                        <h2 className="card-title">{s.name}</h2>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span className={`badge ${s.severity === 'Severe' ? 'badge-danger' : s.severity === 'Moderate' ? 'badge-warning' : 'badge-success'}`}>{s.severity}</span>
                                            <button className="btn btn-sm btn-danger" onClick={() => deleteSymptom(i)}>🗑️</button>
                                        </div>
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        Reported: {new Date(s.reportedDate).toLocaleDateString('en-IN')}
                                    </p>
                                    {s.notes && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>{s.notes}</p>}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default PatientDetail;
