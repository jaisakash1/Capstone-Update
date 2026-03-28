function PatientDetailsFull({ patient, onBack }) {
  if (!patient) return null;

  return (
    <div className="details">

      <button className="back-btn" onClick={onBack}>
        ← Back
      </button>

      <div className="card">
        <h3>Patient Profile</h3>

        <div className="grid">
          <div>ID: {patient.patientId}</div>
          <div>Name: {patient.name}</div>
          <div>Age: {patient.age}</div>
          <div>Gender: {patient.gender}</div>
          <div>Visits: {patient.inpatientVisits}</div>
          <div>Hospital Days: {patient.timeInHospital}</div>
        </div>
      </div>

      <div className="card">
        <h3>Clinical</h3>
        <p>HbA1c: {patient.hba1c}</p>
        <p>Sugar: {patient.sugarLevel}</p>
        <p>Emergency Visits: {patient.emergencyVisits}</p>
      </div>

    </div>
  );
}

export default PatientDetailsFull;