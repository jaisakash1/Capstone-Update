import { useState, useEffect } from 'react';
import { portalAPI } from '../../services/api';

function PatientDiseases() {
    const [diseases, setDiseases] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDiseases();
    }, []);

    const fetchDiseases = async () => {
        try {
            const res = await portalAPI.getDiseases();
            setDiseases(res.data);
        } catch (err) {
            console.error('Error fetching diseases:', err);
        } finally {
            setLoading(false);
        }
    };

    const statusConfig = {
        Active: { class: 'badge-danger', icon: '🔴' },
        Managed: { class: 'badge-warning', icon: '🟡' },
        Resolved: { class: 'badge-success', icon: '🟢' }
    };

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">My Conditions</h1>
                <p className="page-subtitle">Diagnosed conditions and their current status</p>
            </div>

            {diseases.length === 0 ? (
                <div className="empty-state">
                    <h3>📋 No Conditions Recorded</h3>
                    <p>Your diagnosed conditions will appear here once added by your healthcare provider.</p>
                </div>
            ) : (
                <div className="diseases-grid">
                    {diseases.map((disease, index) => {
                        const config = statusConfig[disease.status] || statusConfig.Active;
                        return (
                            <div key={index} className="card disease-card">
                                <div className="card-header">
                                    <h2 className="card-title">{config.icon} {disease.name}</h2>
                                    <span className={`badge ${config.class}`}>{disease.status}</span>
                                </div>
                                <div className="report-details">
                                    <div className="report-detail-row">
                                        <span className="detail-label">📅 Diagnosed</span>
                                        <span className="detail-value">
                                            {new Date(disease.diagnosedDate).toLocaleDateString('en-IN', {
                                                year: 'numeric', month: 'long', day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    {disease.notes && (
                                        <div className="report-detail-row">
                                            <span className="detail-label">📝 Notes</span>
                                            <span className="detail-value">{disease.notes}</span>
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

export default PatientDiseases;
