
function RiskDriversPanel({ patient }) {
  if (!patient) {
    return (
      <section className="card-block side-card">
        <h2>Top Risk Drivers</h2>
        <div className="empty-box">No patient selected</div>
      </section>
    );
  }

  const tags = [];

  if ((patient.timeInHospital || 0) > 7) tags.push("Long hospital stay");
  if ((patient.diabetesMed || "") === "Yes") tags.push("Diabetes");
  if ((patient.sugarLevel || 0) >= 140) tags.push("High sugar");
  if ((patient.hba1c || "") === "Abnormal") tags.push("Abnormal HbA1c");
  if ((patient.emergencyVisits || 0) > 0) tags.push("Emergency visits");

  if ((patient.age || 0) > 60) tags.push("Older age");
  if ((patient.inpatientVisits || 0) > 1) tags.push("Frequent prior admissions");
  if ((patient.bloodPressure?.systolic || 0) > 140 || (patient.bloodPressure?.diastolic || 0) > 90) {
    tags.push("Hypertension");
  }

  return (
    <section className="card-block side-card">
      <h2>Top Risk Drivers</h2>
      <div className="chip-wrap">
        {tags.map((t) => (
          <span key={t} className="chip">
            {t}
          </span>
        ))}
      </div>
    </section>
  );
}

export default RiskDriversPanel;