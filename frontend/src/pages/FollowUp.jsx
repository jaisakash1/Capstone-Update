import { useState, useEffect } from 'react';
import { patientAPI, followUpAPI } from '../services/api';

function FollowUp() {
    const [patients, setPatients] = useState([]);
    const [followUps, setFollowUps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showRecommendations, setShowRecommendations] = useState(null);
    const [formData, setFormData] = useState({
        patient: '',
        type: '7day',
        scheduledDate: '',
        notes: ''
    });
    const [completeForm, setCompleteForm] = useState({
        id: '',
        result: 'Normal',
        notes: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [patientsRes, followUpsRes] = await Promise.all([
                patientAPI.getAll(),
                followUpAPI.getAll()
            ]);
            setPatients(patientsRes.data);
            setFollowUps(followUpsRes.data);
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
            await followUpAPI.create(formData);
            setMessage({ type: 'success', text: '✅ Follow-up scheduled successfully!' });
            setFormData({ patient: '', type: '7day', scheduledDate: '', notes: '' });
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

    const handleComplete = async (id) => {
        try {
            const response = await followUpAPI.complete(id, {
                result: completeForm.result,
                notes: completeForm.notes
            });

            if (response.data.result === 'Abnormal') {
                setShowRecommendations(response.data);
            } else {
                setMessage({ type: 'success', text: '✅ Follow-up completed! All results normal.' });
            }

            setCompleteForm({ id: '', result: 'Normal', notes: '' });
            fetchData();
        } catch (error) {
            setMessage({
                type: 'danger',
                text: `❌ Error: ${error.response?.data?.error || error.message}`
            });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this follow-up?')) {
            try {
                await followUpAPI.delete(id);
                setFollowUps(followUps.filter(f => f._id !== id));
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
                <h1 className="page-title">Follow-up Management</h1>
                <p className="page-subtitle">Schedule and track patient follow-ups</p>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type}`}>
                    {message.text}
                </div>
            )}

            {showRecommendations && (
                <div className="modal-overlay" onClick={() => setShowRecommendations(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>⚠️ Abnormal Result - Recommended Tests</h3>
                            <button className="modal-close" onClick={() => setShowRecommendations(null)}>×</button>
                        </div>
                        <div className="alert alert-warning">
                            The follow-up result is abnormal. The following tests are recommended:
                        </div>
                        <ul style={{ marginLeft: '20px', marginTop: '16px' }}>
                            {showRecommendations.recommendedTests?.map((test, i) => (
                                <li key={i} style={{ padding: '8px 0' }}>🔬 {test}</li>
                            ))}
                        </ul>
                        <button
                            className="btn btn-primary"
                            style={{ marginTop: '20px' }}
                            onClick={() => setShowRecommendations(null)}
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}

            <div className="card" style={{ marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '20px' }}>📅 Schedule New Follow-up</h3>
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
                            <label className="form-label">Follow-up Type *</label>
                            <select
                                className="form-select"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                required
                            >
                                <option value="7day">7-Day Follow-up</option>
                                <option value="30day">30-Day Follow-up</option>
                                <option value="90day">90-Day Follow-up</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Scheduled Date *</label>
                            <input
                                type="date"
                                className="form-input"
                                value={formData.scheduledDate}
                                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Notes</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Any notes..."
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? 'Scheduling...' : '📅 Schedule Follow-up'}
                    </button>
                </form>
            </div>

            <div className="card">
                <h3 style={{ marginBottom: '20px' }}>📋 Follow-up Records</h3>
                {followUps.length === 0 ? (
                    <div className="empty-state">
                        <p>No follow-ups scheduled yet</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Type</th>
                                    <th>Scheduled</th>
                                    <th>Status</th>
                                    <th>Result</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {followUps.map(f => (
                                    <tr key={f._id}>
                                        <td>
                                            <strong>{f.patient?.name || 'Unknown'}</strong>
                                        </td>
                                        <td>
                                            <span className="badge badge-info">{f.type}</span>
                                        </td>
                                        <td>{new Date(f.scheduledDate).toLocaleDateString()}</td>
                                        <td>
                                            {f.isCompleted ? (
                                                <span className="badge badge-success">Completed</span>
                                            ) : (
                                                <span className="badge badge-warning">Pending</span>
                                            )}
                                        </td>
                                        <td>
                                            {f.isCompleted ? (
                                                <span className={`badge ${f.result === 'Abnormal' ? 'badge-danger' : 'badge-success'
                                                    }`}>
                                                    {f.result}
                                                </span>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                        <td>
                                            <div className="actions">
                                                {!f.isCompleted && (
                                                    <button
                                                        className="btn btn-sm btn-success"
                                                        onClick={() => {
                                                            const result = prompt('Enter result (Normal/Abnormal):');
                                                            if (result) {
                                                                setCompleteForm({ ...completeForm, result });
                                                                handleComplete(f._id);
                                                            }
                                                        }}
                                                        title="Complete"
                                                    >
                                                        ✓
                                                    </button>
                                                )}
                                                {f.recommendedTests?.length > 0 && (
                                                    <button
                                                        className="btn btn-sm btn-outline"
                                                        onClick={() => setShowRecommendations(f)}
                                                        title="View Recommendations"
                                                    >
                                                        🔬
                                                    </button>
                                                )}
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleDelete(f._id)}
                                                    title="Delete"
                                                >
                                                    🗑️
                                                </button>
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

export default FollowUp;
