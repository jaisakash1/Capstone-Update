import { useState, useEffect } from 'react';
import { portalAPI } from '../../services/api';

function PatientPendingReports() {
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        try {
            const res = await portalAPI.getPendingReports();
            setPending(res.data);
        } catch (err) {
            console.error('Error fetching pending reports:', err);
        } finally {
            setLoading(false);
        }
    };

    const getDaysRemaining = (dateStr) => {
        const diff = new Date(dateStr) - new Date();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days;
    };

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Pending Reports</h1>
                <p className="page-subtitle">Follow-up appointments awaiting completion</p>
            </div>

            {pending.length === 0 ? (
                <div className="empty-state">
                    <h3>✅ All Caught Up!</h3>
                    <p>You have no pending follow-up reports.</p>
                </div>
            ) : (
                <div className="reports-list">
                    {pending.map((item) => {
                        const daysLeft = getDaysRemaining(item.scheduledDate);
                        const isOverdue = daysLeft < 0;
                        const isToday = daysLeft === 0;

                        return (
                            <div key={item._id} className="card" style={{ marginBottom: '16px' }}>
                                <div className="card-header">
                                    <h2 className="card-title">{item.type} Follow-up</h2>
                                    <span className={`badge ${isOverdue ? 'badge-danger' : isToday ? 'badge-warning' : 'badge-info'}`}>
                                        {isOverdue ? `Overdue by ${Math.abs(daysLeft)} day(s)` : isToday ? 'Today' : `In ${daysLeft} day(s)`}
                                    </span>
                                </div>
                                <div className="report-details">
                                    <div className="report-detail-row">
                                        <span className="detail-label">📅 Scheduled Date</span>
                                        <span className="detail-value">
                                            {new Date(item.scheduledDate).toLocaleDateString('en-IN', {
                                                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <div className="report-detail-row">
                                        <span className="detail-label">📊 Result</span>
                                        <span className="detail-value">
                                            <span className="badge badge-warning">Pending</span>
                                        </span>
                                    </div>
                                    {item.notes && (
                                        <div className="report-detail-row">
                                            <span className="detail-label">📝 Notes</span>
                                            <span className="detail-value">{item.notes}</span>
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

export default PatientPendingReports;
