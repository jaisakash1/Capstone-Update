import { useState, useEffect } from 'react';
import { portalAPI } from '../../services/api';

function PatientReports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const res = await portalAPI.getReports();
            setReports(res.data);
        } catch (err) {
            console.error('Error fetching reports:', err);
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
                <h1 className="page-title">My Reports</h1>
                <p className="page-subtitle">View your completed follow-up reports and test results</p>
            </div>

            {reports.length === 0 ? (
                <div className="empty-state">
                    <h3>📄 No Reports Yet</h3>
                    <p>Your completed reports will appear here.</p>
                </div>
            ) : (
                <div className="reports-list">
                    {reports.map((report) => (
                        <div key={report._id} className="card report-card" style={{ marginBottom: '16px' }}>
                            <div className="card-header">
                                <h2 className="card-title">
                                    {report.type} Follow-up
                                </h2>
                                <span className={`badge ${report.result === 'Normal' ? 'badge-success' : 'badge-danger'}`}>
                                    {report.result}
                                </span>
                            </div>
                            <div className="report-details">
                                <div className="report-detail-row">
                                    <span className="detail-label">📅 Completed</span>
                                    <span className="detail-value">
                                        {new Date(report.completedDate).toLocaleDateString('en-IN', {
                                            year: 'numeric', month: 'long', day: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <div className="report-detail-row">
                                    <span className="detail-label">📋 Scheduled</span>
                                    <span className="detail-value">
                                        {new Date(report.scheduledDate).toLocaleDateString('en-IN', {
                                            year: 'numeric', month: 'long', day: 'numeric'
                                        })}
                                    </span>
                                </div>
                                {report.notes && (
                                    <div className="report-detail-row">
                                        <span className="detail-label">📝 Notes</span>
                                        <span className="detail-value">{report.notes}</span>
                                    </div>
                                )}
                            </div>
                            {report.recommendedTests && report.recommendedTests.length > 0 && (
                                <div className="recommended-tests">
                                    <h4>🧪 Recommended Tests</h4>
                                    <div className="test-tags">
                                        {report.recommendedTests.map((test, i) => (
                                            <span key={i} className="badge badge-warning">{test}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default PatientReports;
