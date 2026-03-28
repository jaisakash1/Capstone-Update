
// export default PatientSearchResultPanel;
function PatientSearchResultPanel({ patient, onBack }) {
  return (
    <section className="card-block">
      <div className="section-head simple-head">
        <div>
          <h2>Patient Search Result</h2>
          <p>You searched the stored records of the below patient from the hospital database.</p>
        </div>

        <button type="button" className="back-btn" onClick={onBack}>
          ← Back to Queue
        </button>
      </div>

      <div className="fetch-row">
        <div className="fetch-input-wrap">
          <label>Patient ID</label>
          <input value={patient?.patientId || ""} readOnly />
        </div>

      </div>
    </section>
  );
}

export default PatientSearchResultPanel;