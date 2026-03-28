function ClinicalActionPanel({ patient }) {
  return (
    <section className="card-block side-card">
      <h2>Clinical Action Summary</h2>
      <div className="action-list">
        <div className="action-item">
          {patient?.recommendedAction || "Routine discharge. Standard OPD follow-up."}
        </div>
        <div className="action-item">Flag for case manager or doctor review.</div>
        <div className="action-item">Provide reinforced discharge counseling.</div>
        <div className="action-item">Monitor glycemic control closely.</div>
        <div className="action-item">Review anemia and nutrition support.</div>
        <div className="action-item">Coordinate renal follow-up.</div>
      </div>
    </section>
  );
}

export default ClinicalActionPanel;