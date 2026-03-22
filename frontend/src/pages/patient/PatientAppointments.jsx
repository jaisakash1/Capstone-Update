import { useState, useEffect } from 'react';
import { portalAPI } from '../../services/api';

function PatientAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await portalAPI.getAppointments();
            setAppointments(res.data);
        } catch (err) {
            console.error('Error fetching appointments:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatus = (appt) => {
        if (appt.isCompleted) return { label: 'Completed', class: 'badge-success', icon: '✅' };
        const daysLeft = Math.ceil((new Date(appt.scheduledDate) - new Date()) / (1000 * 60 * 60 * 24));
        if (daysLeft < 0) return { label: 'Missed', class: 'badge-danger', icon: '❌' };
        if (daysLeft === 0) return { label: 'Today', class: 'badge-warning', icon: '📍' };
        return { label: 'Upcoming', class: 'badge-info', icon: '🔜' };
    };

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Appointments</h1>
                <p className="page-subtitle">Your follow-up appointment schedule</p>
            </div>

            {appointments.length === 0 ? (
                <div className="empty-state">
                    <h3>📅 No Appointments</h3>
                    <p>Your appointments will appear here once scheduled by your doctor.</p>
                </div>
            ) : (
                <div className="appointments-timeline">
                    {appointments.map((appt) => {
                        const status = getStatus(appt);
                        return (
                            <div key={appt._id} className="timeline-item">
                                <div className="timeline-marker">
                                    <span>{status.icon}</span>
                                </div>
                                <div className="card timeline-card">
                                    <div className="card-header">
                                        <h2 className="card-title">{appt.type} Follow-up</h2>
                                        <span className={`badge ${status.class}`}>{status.label}</span>
                                    </div>
                                    <div className="report-details">
                                        <div className="report-detail-row">
                                            <span className="detail-label">📅 Scheduled</span>
                                            <span className="detail-value">
                                                {new Date(appt.scheduledDate).toLocaleDateString('en-IN', {
                                                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        {appt.isCompleted && appt.completedDate && (
                                            <div className="report-detail-row">
                                                <span className="detail-label">✅ Completed</span>
                                                <span className="detail-value">
                                                    {new Date(appt.completedDate).toLocaleDateString('en-IN', {
                                                        year: 'numeric', month: 'long', day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                        {appt.result && appt.result !== 'Pending' && (
                                            <div className="report-detail-row">
                                                <span className="detail-label">📊 Result</span>
                                                <span className="detail-value">
                                                    <span className={`badge ${appt.result === 'Normal' ? 'badge-success' : 'badge-danger'}`}>
                                                        {appt.result}
                                                    </span>
                                                </span>
                                            </div>
                                        )}
                                        {appt.notes && (
                                            <div className="report-detail-row">
                                                <span className="detail-label">📝 Notes</span>
                                                <span className="detail-value">{appt.notes}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default PatientAppointments;
