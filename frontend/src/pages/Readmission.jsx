import { useState, useEffect } from 'react';
import { patientAPI, readmissionAPI } from '../services/api';

function Readmission() {
    const [patients, setPatients] = useState([]);
    const [readmissions, setReadmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({
        patient: '',
        reason: '',
        notes: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [patientsRes, readmissionsRes] = await Promise.all([
                patientAPI.getAll(),
                readmissionAPI.getAll()
            ]);
            setPatients(patientsRes.data);
            setReadmissions(readmissionsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            await readmissionAPI.create(formData);
            setMessage({ type: 'success', text: '✅ Readmission recorded successfully!' });
            setFormData({ patient: '', reason: '', notes: '' });
            fetchData();
        } catch (error) {
            setMessage({
                type: 'danger',
                text: `❌ Error: ${error.response?.data?.error || error.message}`
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this readmission record?')) {
            try {
                await readmissionAPI.delete(id);
                setReadmissions(readmissions.filter(r => r._id !== id));
            } catch (error) {
                console.error('Error deleting:', error);
            }
        }
    };

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
                <h1 className="page-title">Readmission Tracking</h1>
                <p className="page-subtitle">Record and monitor hospital readmissions</p>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="card" style={{ marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '20px' }}>🔄 Record New Readmission</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Select Patient *</label>
                            <select
                                className="form-select"
                                value={formData.patient}
                                onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
                                required
                            >
                                <option value="">-- Select Patient --</option>
                                {patients.map(p => (
                                    <option key={p._id} value={p._id}>
                                        {p.name} ({p.gender}, {p.age} yrs)
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Reason for Readmission *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                placeholder="e.g., High blood sugar, Complications..."
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Additional Notes</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Any additional notes..."
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? 'Recording...' : '💾 Record Readmission'}
                    </button>
                </form>
            </div>

            <div className="card">
                <h3 style={{ marginBottom: '20px' }}>📋 Readmission History</h3>
                {readmissions.length === 0 ? (
                    <div className="empty-state">
                        <p>No readmissions recorded yet</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Reason</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {readmissions.map(r => (
                                    <tr key={r._id}>
                                        <td>
                                            <strong>{r.patient?.name || 'Unknown'}</strong>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                {r.patient?.gender}, {r.patient?.age} yrs
                                            </div>
                                        </td>
                                        <td>{r.reason}</td>
                                        <td>{new Date(r.readmissionDate).toLocaleDateString()}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleDelete(r._id)}
                                            >
                                                🗑️
                                            </button>
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

export default Readmission;
