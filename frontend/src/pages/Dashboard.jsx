import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientAPI, reportAPI } from '../services/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalPatients: 0,
        patientsVisitedThisMonth: 0,
        readmissionsThisMonth: 0,
        pendingLabReports: 0,
        abnormalA1c: 0,
        pendingFollowUps: 0
    });
    const [critical, setCritical] = useState({ abnormalPatients: [], overdueFollowUps: [] });
    const [charts, setCharts] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, summaryRes, criticalRes, chartsRes] = await Promise.all([
                patientAPI.getStats(),
                reportAPI.getSummary(),
                patientAPI.getCritical(),
                reportAPI.getCharts()
            ]);
            setStats({ ...statsRes.data, ...summaryRes.data });
            setCritical(criticalRes.data);
            setCharts(chartsRes.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
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
                    <div className="stat-info"><h3>{stats.totalPatients || 0}</h3><p>Total Patients</p></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">🏥</div>
                    <div className="stat-info"><h3>{stats.patientsVisitedThisMonth || 0}</h3><p>Visited This Month</p></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon orange">⏳</div>
                    <div className="stat-info"><h3>{stats.pendingLabReports || 0}</h3><p>Pending Lab Reports</p></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon red">⚠️</div>
                    <div className="stat-info"><h3>{stats.abnormalA1c || 0}</h3><p>Abnormal A1C</p></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon purple">🔄</div>
                    <div className="stat-info"><h3>{stats.readmissionsThisMonth || 0}</h3><p>Readmissions This Month</p></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon blue">📋</div>
                    <div className="stat-info"><h3>{stats.pendingFollowUps || 0}</h3><p>Pending Follow-ups</p></div>
                </div>
            </div>

            {/* Critical Patients Section */}
            {(critical.abnormalPatients.length > 0 || critical.overdueFollowUps.length > 0) && (
                <div className="card" style={{ marginTop: '24px', borderLeft: '4px solid var(--accent-danger)' }}>
                    <div className="card-header">
                        <h2 className="card-title">⚠️ Patients Needing Attention</h2>
                    </div>

                    {critical.abnormalPatients.length > 0 && (
                        <div style={{ marginBottom: '20px' }}>
                            <h4 style={{ color: 'var(--accent-danger)', marginBottom: '12px', fontSize: '0.95rem' }}>
                                🔴 Abnormal HbA1c Results ({critical.abnormalPatients.length})
                            </h4>
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr><th>Patient</th><th>ID</th><th>Age</th><th>HbA1c</th><th>Action</th></tr>
                                    </thead>
                                    <tbody>
                                        {critical.abnormalPatients.map(p => (
                                            <tr key={p._id}>
                                                <td><strong>{p.name}</strong></td>
                                                <td><span style={{ fontFamily: 'Courier New', color: 'var(--accent-primary)', fontSize: '0.85rem' }}>{p.patientId}</span></td>
                                                <td>{p.age} yrs</td>
                                                <td><span className="badge badge-danger">{p.hba1c}</span></td>
                                                <td><button className="btn btn-sm btn-primary" onClick={() => navigate(`/patients/${p._id}`)}>View</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {critical.overdueFollowUps.length > 0 && (
                        <div>
                            <h4 style={{ color: 'var(--accent-warning)', marginBottom: '12px', fontSize: '0.95rem' }}>
                                🟡 Overdue Follow-ups ({critical.overdueFollowUps.length})
                            </h4>
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr><th>Patient</th><th>Type</th><th>Scheduled</th><th>Days Overdue</th></tr>
                                    </thead>
                                    <tbody>
                                        {critical.overdueFollowUps.map(f => (
                                            <tr key={f._id}>
                                                <td><strong>{f.patient?.name || 'Unknown'}</strong></td>
                                                <td><span className="badge badge-warning">{f.type}</span></td>
                                                <td>{new Date(f.scheduledDate).toLocaleDateString('en-IN')}</td>
                                                <td style={{ color: 'var(--accent-danger)', fontWeight: '600' }}>
                                                    {Math.floor((Date.now() - new Date(f.scheduledDate)) / (1000 * 60 * 60 * 24))} days
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Charts Section */}
            {charts && (
                <div style={{ marginTop: '24px' }}>
                    <h2 style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>📊 Analytics</h2>
                    <div className="charts-grid">
                        {/* HbA1c Pie Chart */}
                        {charts.hba1cDistribution.length > 0 && (
                            <div className="card chart-card">
                                <h3 style={{ marginBottom: '16px', fontSize: '1rem', color: 'var(--text-secondary)' }}>HbA1c Distribution</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie data={charts.hba1cDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={90}
                                            paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                                            {charts.hba1cDistribution.map((_, i) => (
                                                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Monthly Admissions Bar Chart */}
                        {charts.monthlyAdmissions.length > 0 && (
                            <div className="card chart-card">
                                <h3 style={{ marginBottom: '16px', fontSize: '1rem', color: 'var(--text-secondary)' }}>Monthly Admissions</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={charts.monthlyAdmissions}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                        <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} allowDecimals={false} />
                                        <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                                        <Bar dataKey="patients" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Gender Pie Chart */}
                        {charts.genderDistribution.length > 0 && (
                            <div className="card chart-card">
                                <h3 style={{ marginBottom: '16px', fontSize: '1rem', color: 'var(--text-secondary)' }}>Gender Distribution</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie data={charts.genderDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={90}
                                            paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                                            {charts.genderDistribution.map((_, i) => (
                                                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Age Group Bar Chart */}
                        {charts.ageGroups.length > 0 && (
                            <div className="card chart-card">
                                <h3 style={{ marginBottom: '16px', fontSize: '1rem', color: 'var(--text-secondary)' }}>Age Distribution</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={charts.ageGroups}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                        <XAxis dataKey="range" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} allowDecimals={false} />
                                        <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                                        <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="card" style={{ marginTop: '24px' }}>
                <div className="card-header">
                    <h2 className="card-title">🏥 Quick Actions</h2>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <a href="/new-patient" className="btn btn-primary">➕ Add New Patient</a>
                    <a href="/followup" className="btn btn-outline">📋 Schedule Follow-up</a>
                    <a href="/reports" className="btn btn-outline">📄 Generate Reports</a>
                    <a href="/settings" className="btn btn-outline">⚙️ Hospital Settings</a>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
