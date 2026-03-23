import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientAPI, reportAPI } from '../services/api';

function PatientList() {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [credentials, setCredentials] = useState(null);

    useEffect(() => {
        fetchPatients();
    }, [filter]);

    const fetchPatients = async () => {
        try {
            const params = {};
            if (filter === 'eligible') params.eligible = 'true';
            if (filter === 'ineligible') params.eligible = 'false';

            const response = await patientAPI.getAll(params);
            setPatients(response.data);
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this patient?')) {
            try {
                await patientAPI.delete(id);
                setPatients(patients.filter(p => p._id !== id));
            } catch (error) {
                console.error('Error deleting patient:', error);
            }
        }
    };

    const downloadReport = (patientId) => {
        const url = reportAPI.getPatientReport(patientId);
        window.open(url, '_blank');
    };

    const viewCredentials = async (id) => {
        try {
            const res = await patientAPI.getCredentials(id);
            setCredentials(res.data);
        } catch (err) {
            console.error('Error fetching credentials:', err);
        }
    };

    const copyCredentials = () => {
        if (credentials) {
            const text = `Patient ID: ${credentials.patientId}\nPassword: ${credentials.password}`;
            navigator.clipboard.writeText(text);
            alert('Credentials copied!');
        }
    };

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.patientId && p.patientId.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Patient List</h1>
                <p className="page-subtitle">View and manage all registered patients</p>
            </div>

            <div className="filter-bar">
                <input
                    type="text"
                    className="form-input search-input"
                    placeholder="🔍 Search by name or patient ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div className="tabs">
                    <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
                    <button className={`tab ${filter === 'eligible' ? 'active' : ''}`} onClick={() => setFilter('eligible')}>✅ Eligible</button>
                    <button className={`tab ${filter === 'ineligible' ? 'active' : ''}`} onClick={() => setFilter('ineligible')}>❌ Ineligible</button>
                </div>
            </div>

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
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                            <button className="btn btn-primary" onClick={copyCredentials}>📋 Copy</button>
                            <button className="btn btn-outline" onClick={() => setCredentials(null)}>✓ Close</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="card">
                {filteredPatients.length === 0 ? (
                    <div className="empty-state">
                        <h3>No patients found</h3>
                        <p>Start by adding a new patient</p>
                        <a href="/new-patient" className="btn btn-primary" style={{ marginTop: '16px' }}>
                            ➕ Add New Patient
                        </a>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Patient ID</th>
                                    <th>Age</th>
                                    <th>HbA1c</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPatients.map(patient => (
                                    <tr key={patient._id}>
                                        <td>
                                            <div>
                                                <strong>{patient.name}</strong>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                    {patient.gender} • {patient.email || 'No email'}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ fontFamily: 'Courier New', fontSize: '0.85rem', color: 'var(--accent-primary)' }}>
                                                {patient.patientId || 'N/A'}
                                            </span>
                                        </td>
                                        <td>{patient.age} yrs</td>
                                        <td>
                                            <span className={`badge ${patient.hba1c === 'Abnormal' ? 'badge-danger' : patient.hba1c === 'Normal' ? 'badge-success' : 'badge-warning'}`}>
                                                {patient.hba1c}
                                            </span>
                                        </td>
                                        <td>
                                            {patient.isEligible ? (
                                                <span className="badge badge-success">Eligible</span>
                                            ) : (
                                                <span className="badge badge-danger" title={patient.eliminationReason}>Ineligible</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="actions">
                                                <button className="btn btn-sm btn-primary" onClick={() => navigate(`/patients/${patient._id}`)} title="View & Edit">✏️</button>
                                                <button className="btn btn-sm btn-outline" onClick={() => viewCredentials(patient._id)} title="View Credentials">🔐</button>
                                                <button className="btn btn-sm btn-outline" onClick={() => downloadReport(patient._id)} title="Download Report">📄</button>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(patient._id)} title="Delete">🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PatientList;
