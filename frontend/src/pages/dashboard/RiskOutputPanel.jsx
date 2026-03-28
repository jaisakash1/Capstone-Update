
function RiskOutputPanel({ patient }) {
  if (!patient) {
    return (
      <section className="card-block side-card">
        <h2>Readmission Risk Output</h2>
        <div className="empty-box">No patient selected</div>
      </section>
    );
  }

  const rawScore = Number(patient.riskScore || 0);
  const percent = rawScore <= 10 ? (rawScore / 10) * 100 : rawScore;

  return (
    <section className="card-block side-card">
      <h2>Readmission Risk Output</h2>

      <div className="risk-output-top">
        <span className="muted-label">Risk Score</span>
        <div className="risk-big">{Math.round(percent)}%</div>
      </div>

      <div className="progress-bar">
        <div
          className={`progress-fill ${String(patient.riskLevel || "").toLowerCase()}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>

      <div className="risk-level-row">
        <span className="muted-label">Risk Level</span>
        <span className={`risk-pill ${String(patient.riskLevel || "").toLowerCase()}`}>
          {patient.riskLevel}
        </span>
      </div>

      <div className="prediction-box">
        <span className="muted-label">Prediction Mode</span>
        <strong>ML-ready scoring / replaceable with trained model</strong>
      </div>
    </section>
  );
}

export default RiskOutputPanel;