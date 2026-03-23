import { useState, useEffect } from 'react';
import { portalAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function PatientDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showNotification, setShowNotification] = useState(false);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const res = await portalAPI.getDashboard();
            setData(res.data);
            if (res.data.hasUpdates) {
                setShowNotification(true);
            }
        } catch (err) {
            console.error('Error fetching dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = () => {
        const token = localStorage.getItem('token');
        const url = portalAPI.downloadReport();
        // Open in new tab with auth
        fetch(url, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => res.blob())
            .then(blob => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `${data?.patient?.patientId || 'my'}_health_report.pdf`;
                link.click();
                URL.revokeObjectURL(link.href);
            })
            .catch(err => console.error('Download failed:', err));
    };

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    if (!data) {
        return <div className="empty-state"><h3>Unable to load dashboard</h3></div>;
    }

    const { patient, stats, nextAppointment, lastUpdatedAt } = data;
    const hospital = patient?.hospital;

    return (
        <div>
            {/* Notification Banner */}
            {showNotification && (
                <div className="notification-banner" onClick={() => setShowNotification(false)}>
                    <div className="notification-content">
                        <span className="notification-icon">🔔</span>
                        <div>
                            <strong>Your records were updated</strong>
                            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>
                                Last updated: {lastUpdatedAt ? new Date(lastUpdatedAt).toLocaleString('en-IN') : 'Recently'}
                            </p>
                        </div>
                        <button className="notification-close" onClick={(e) => { e.stopPropagation(); setShowNotification(false); }}>✕</button>
                    </div>
                </div>
            )}

            {/* Welcome Header */}
            <div className="patient-welcome">
                <div className="welcome-text">
                    <h1>Welcome, {patient?.name} 👋</h1>
                    <p className="patient-id-display">ID: {patient?.patientId}</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button className="btn btn-primary" onClick={handleDownloadReport}>📥 Download Report</button>
                    <span className={`badge ${patient?.isEligible ? 'badge-success' : 'badge-info'}`}>
                        {patient?.isEligible ? '✅ Enrolled in Program' : 'ℹ️ Under Review'}
                    </span>
                </div>
            </div>

            {/* Vital Stats Cards */}
            <div className="stats-grid" style={{ marginTop: '24px' }}>
                <div className="stat-card">
                    <div className="stat-icon red">❤️</div>
                    <div className="stat-info">
                        <h3>{patient?.bloodPressure?.systolic || '--'}/{patient?.bloodPressure?.diastolic || '--'}</h3>
                        <p>Blood Pressure (mmHg)</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon orange">🩸</div>
                    <div className="stat-info">
                        <h3>{patient?.sugarLevel || '--'}</h3>
                        <p>Sugar Level (mg/dL)</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon blue">🔬</div>
                    <div className="stat-info">
                        <h3>
                            <span className={`badge ${patient?.hba1c === 'Normal' ? 'badge-success' : patient?.hba1c === 'Abnormal' ? 'badge-danger' : 'badge-warning'}`}>
                                {patient?.hba1c || 'Pending'}
                            </span>
                        </h3>
                        <p>HbA1c Status</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">🧪</div>
                    <div className="stat-info">
                        <h3>
                            <span className={`badge ${patient?.glucose === 'Normal' ? 'badge-success' : patient?.glucose === 'Abnormal' ? 'badge-danger' : 'badge-warning'}`}>
                                {patient?.glucose || 'Pending'}
                            </span>
                        </h3>
                        <p>Glucose Status</p>
                    </div>
                </div>
            </div>

            {/* Quick Overview Row */}
            <div className="stats-grid" style={{ marginTop: '24px' }}>
                <div className="stat-card">
                    <div className="stat-icon purple">📋</div>
                    <div className="stat-info"><h3>{stats?.pendingFollowUps || 0}</h3><p>Pending Reports</p></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">✅</div>
                    <div className="stat-info"><h3>{stats?.completedFollowUps || 0}</h3><p>Completed Reports</p></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon orange">🔄</div>
                    <div className="stat-info"><h3>{stats?.totalReadmissions || 0}</h3><p>Total Readmissions</p></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon blue">💊</div>
                    <div className="stat-info"><h3>{patient?.diabetesMed || 'N/A'}</h3><p>On Medication</p></div>
                </div>
            </div>

            {/* Next Appointment */}
            {nextAppointment && (
                <div className="card" style={{ marginTop: '24px' }}>
                    <div className="card-header">
                        <h2 className="card-title">📅 Next Appointment</h2>
                        <span className="badge badge-info">Upcoming</span>
                    </div>
                    <div className="appointment-preview">
                        <div className="appointment-detail">
                            <span className="detail-label">Type</span>
                            <span className="detail-value">{nextAppointment.type} Follow-up</span>
                        </div>
                        <div className="appointment-detail">
                            <span className="detail-label">Date</span>
                            <span className="detail-value">{new Date(nextAppointment.scheduledDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Hospital Contact Card */}
            {hospital && (
                <div className="card hospital-contact-card" style={{ marginTop: '24px' }}>
                    <div className="card-header">
                        <h2 className="card-title">🏥 Hospital Contact Information</h2>
                    </div>
                    <div className="contact-grid">
                        <div className="contact-item">
                            <span className="contact-icon">🏥</span>
                            <div><span className="contact-label">Hospital</span><span className="contact-value">{hospital.name}</span></div>
                        </div>
                        <div className="contact-item">
                            <span className="contact-icon">📍</span>
                            <div><span className="contact-label">Address</span><span className="contact-value">{hospital.address || 'N/A'}</span></div>
                        </div>
                        <div className="contact-item">
                            <span className="contact-icon">📞</span>
                            <div><span className="contact-label">Phone</span><span className="contact-value">{hospital.phone || 'N/A'}</span></div>
                        </div>
                        <div className="contact-item">
                            <span className="contact-icon">🚨</span>
                            <div><span className="contact-label">Emergency</span><span className="contact-value">{hospital.emergencyContact || 'N/A'}</span></div>
                        </div>
                        <div className="contact-item">
                            <span className="contact-icon">📧</span>
                            <div><span className="contact-label">Email</span><span className="contact-value">{hospital.email || 'N/A'}</span></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Personal Info */}
            <div className="card" style={{ marginTop: '24px' }}>
                <div className="card-header">
                    <h2 className="card-title">👤 Personal Information</h2>
                </div>
                <div className="contact-grid">
                    <div className="contact-item">
                        <span className="contact-icon">👤</span>
                        <div><span className="contact-label">Full Name</span><span className="contact-value">{patient?.name}</span></div>
                    </div>
                    <div className="contact-item">
                        <span className="contact-icon">🎂</span>
                        <div><span className="contact-label">Age</span><span className="contact-value">{patient?.age} years</span></div>
                    </div>
                    <div className="contact-item">
                        <span className="contact-icon">⚧</span>
                        <div><span className="contact-label">Gender</span><span className="contact-value">{patient?.gender}</span></div>
                    </div>
                    <div className="contact-item">
                        <span className="contact-icon">📱</span>
                        <div><span className="contact-label">Phone</span><span className="contact-value">{patient?.phone || 'N/A'}</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PatientDashboard;
