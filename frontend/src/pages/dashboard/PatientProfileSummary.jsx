function InfoBox({ label, value }) {
  return (
    <div className="info-box">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function PatientProfileSummary({ patient }) {
  return (
    <section className="card-block">
      <div className="section-head simple-head">
        <div>
          <h2>Patient Profile Summary</h2>
        </div>
      </div>

      <div className="profile-grid">
        <InfoBox label="Patient ID" value={patient?.patientId || "--"} />
        <InfoBox label="Name" value={patient?.name || "--"} />
        <InfoBox
          label="Age / Gender"
          value={`${patient?.age ?? "--"} / ${patient?.gender || "--"}`}
        />
        <InfoBox label="Ward" value={patient?.ward || "Medicine"} />
        <InfoBox label="Diagnosis" value={patient?.diagnosis || "Diabetes with CKD"} />
        <InfoBox label="Previous Admissions" value={patient?.inpatientVisits ?? 0} />
        <InfoBox
          label="Last Admission"
          value={patient?.createdAt?.slice?.(0, 10) || "--"}
        />
        <InfoBox
          label="Last Discharge"
          value={patient?.updatedAt?.slice?.(0, 10) || "--"}
        />
        <InfoBox label="Admission Type" value="Emergency" />
      </div>
    </section>
  );
}

export default PatientProfileSummary;