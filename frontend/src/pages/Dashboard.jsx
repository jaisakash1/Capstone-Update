import { useState, useEffect } from 'react';
import { patientAPI, reportAPI } from '../services/api';

function Dashboard() {
    const [stats, setStats] = useState({
        totalPatients: 0,
        eligiblePatients: 0,
        pendingLabReports: 0,
        abnormalA1c: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [statsRes, summaryRes] = await Promise.all([
                patientAPI.getStats(),
                reportAPI.getSummary()
            ]);
            setStats({
                ...statsRes.data,
                ...summaryRes.data
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
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
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Overview of your diabetes patient follow-up system</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon blue">👥</div>
                    <div className="stat-info">
                        <h3>{stats.totalPatients || 0}</h3>
                        <p>Total Patients</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon green">✅</div>
                    <div className="stat-info">
                        <h3>{stats.eligiblePatients || 0}</h3>
                        <p>Eligible for Program</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon orange">⏳</div>
                    <div className="stat-info">
                        <h3>{stats.pendingLabReports || 0}</h3>
                        <p>Pending Lab Reports</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon red">⚠️</div>
                    <div className="stat-info">
                        <h3>{stats.abnormalA1c || 0}</h3>
                        <p>Abnormal A1C Results</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon purple">🔄</div>
                    <div className="stat-info">
                        <h3>{stats.totalReadmissions || 0}</h3>
                        <p>Total Readmissions</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon blue">📋</div>
                    <div className="stat-info">
                        <h3>{stats.pendingFollowUps || 0}</h3>
                        <p>Pending Follow-ups</p>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">🏥 Quick Actions</h2>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <a href="/new-patient" className="btn btn-primary">➕ Add New Patient</a>
                    <a href="/followup" className="btn btn-outline">📋 Schedule Follow-up</a>
                    <a href="/reports" className="btn btn-outline">📄 Generate Reports</a>
                </div>
            </div>

            <div className="card" style={{ marginTop: '24px' }}>
                <div className="card-header">
                    <h2 className="card-title">📊 Eligibility Criteria</h2>
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>
                    <p>Patients are <strong style={{ color: 'var(--accent-success)' }}>eligible</strong> if they meet ALL of the following:</p>
                    <ul style={{ marginTop: '12px', marginLeft: '20px' }}>
                        <li>Hospital stay ≥ 2 days</li>
                        <li>Emergency visits ≤ 3</li>
                        <li>Currently on diabetes medication</li>
                        <li>HbA1c result is Abnormal (high priority)</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
