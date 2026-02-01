import { useState, useEffect } from 'react';
import { patientAPI, reportAPI } from '../services/api';

function Reports() {
    const [patients, setPatients] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [patientsRes, summaryRes] = await Promise.all([
                patientAPI.getAll(),
                reportAPI.getSummary()
            ]);
            setPatients(patientsRes.data);
            setSummary(summaryRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadReport = () => {
        if (!selectedPatient) {
            alert('Please select a patient first');
            return;
        }
        const url = reportAPI.getPatientReport(selectedPatient);
        window.open(url, '_blank');
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
                <h1 className="page-title">Reports & Analytics</h1>
                <p className="page-subtitle">Generate patient reports and view system analytics</p>
            </div>

            <div className="card" style={{ marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '20px' }}>📄 Generate Patient Report</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    Generate a comprehensive PDF report for any patient, including their complete medical history,
                    lab results, readmissions, and follow-up records.
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <select
                        className="form-select"
                        style={{ maxWidth: '400px' }}
                        value={selectedPatient}
                        onChange={(e) => setSelectedPatient(e.target.value)}
                    >
                        <option value="">-- Select a Patient --</option>
                        {patients.map(p => (
                            <option key={p._id} value={p._id}>
                                {p.name} ({p.gender}, {p.age} yrs) - {p.isEligible ? '✅ Eligible' : '❌ Ineligible'}
                            </option>
                        ))}
                    </select>
                    <button className="btn btn-primary" onClick={downloadReport}>
                        📥 Download PDF Report
                    </button>
                </div>
            </div>

            <div className="card">
                <h3 style={{ marginBottom: '20px' }}>📊 System Summary</h3>
                {summary && (
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon blue">👥</div>
                            <div className="stat-info">
                                <h3>{summary.totalPatients}</h3>
                                <p>Total Patients</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon green">✅</div>
                            <div className="stat-info">
                                <h3>{summary.eligiblePatients}</h3>
                                <p>Eligible Patients</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon red">❌</div>
                            <div className="stat-info">
                                <h3>{summary.ineligiblePatients}</h3>
                                <p>Ineligible Patients</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon purple">🔄</div>
                            <div className="stat-info">
                                <h3>{summary.totalReadmissions}</h3>
                                <p>Total Readmissions</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon orange">⏳</div>
                            <div className="stat-info">
                                <h3>{summary.pendingFollowUps}</h3>
                                <p>Pending Follow-ups</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon red">⚠️</div>
                            <div className="stat-info">
                                <h3>{summary.abnormalResults}</h3>
                                <p>Abnormal Results</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="card" style={{ marginTop: '24px' }}>
                <h3 style={{ marginBottom: '20px' }}>📋 Report Features</h3>
                <div style={{ color: 'var(--text-secondary)' }}>
                    <p>Each generated PDF report includes:</p>
                    <ul style={{ marginTop: '12px', marginLeft: '20px' }}>
                        <li>✓ Complete patient demographics and contact info</li>
                        <li>✓ Hospital visit history (days, emergency/inpatient visits)</li>
                        <li>✓ Lab results (HbA1c, Glucose, Blood Pressure, Sugar Levels)</li>
                        <li>✓ Medication status and program eligibility</li>
                        <li>✓ Complete readmission history with reasons</li>
                        <li>✓ Follow-up records with recommended tests</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Reports;
