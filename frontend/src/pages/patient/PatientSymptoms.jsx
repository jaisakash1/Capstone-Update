import { useState, useEffect } from 'react';
import { portalAPI } from '../../services/api';

function PatientSymptoms() {
    const [symptoms, setSymptoms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSymptoms();
    }, []);

    const fetchSymptoms = async () => {
        try {
            const res = await portalAPI.getSymptoms();
            setSymptoms(res.data);
        } catch (err) {
            console.error('Error fetching symptoms:', err);
        } finally {
            setLoading(false);
        }
    };

    const severityConfig = {
        Mild: { class: 'badge-success', icon: '🟢', bar: '33%' },
        Moderate: { class: 'badge-warning', icon: '🟡', bar: '66%' },
        Severe: { class: 'badge-danger', icon: '🔴', bar: '100%' }
    };

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Symptoms Log</h1>
                <p className="page-subtitle">Track and monitor your reported symptoms</p>
            </div>

            {symptoms.length === 0 ? (
                <div className="empty-state">
                    <h3>📋 No Symptoms Recorded</h3>
                    <p>Symptoms reported during your consultations will appear here.</p>
                </div>
            ) : (
                <div className="symptoms-list">
                    {symptoms.map((symptom, index) => {
                        const config = severityConfig[symptom.severity] || severityConfig.Mild;
                        return (
                            <div key={index} className="card" style={{ marginBottom: '16px' }}>
                                <div className="card-header">
                                    <h2 className="card-title">{config.icon} {symptom.name}</h2>
                                    <span className={`badge ${config.class}`}>{symptom.severity}</span>
                                </div>
                                <div className="severity-bar-container">
                                    <div className="severity-bar" style={{ width: config.bar }}></div>
                                </div>
                                <div className="report-details" style={{ marginTop: '12px' }}>
                                    <div className="report-detail-row">
                                        <span className="detail-label">📅 Reported</span>
                                        <span className="detail-value">
                                            {new Date(symptom.reportedDate).toLocaleDateString('en-IN', {
                                                year: 'numeric', month: 'long', day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    {symptom.notes && (
                                        <div className="report-detail-row">
                                            <span className="detail-label">📝 Notes</span>
                                            <span className="detail-value">{symptom.notes}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default PatientSymptoms;
