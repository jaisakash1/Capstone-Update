import { useMemo } from "react";

function DoctorSnapshot({ patients, activePatient, setActivePatient }) {
  const currentIndex = useMemo(() => {
    if (!activePatient || !patients?.length) return 0;
    const idx = patients.findIndex((p) => p._id === activePatient._id);
    return idx >= 0 ? idx : 0;
  }, [activePatient, patients]);

  const goPrev = () => {
    if (!patients?.length) return;
    const nextIndex = (currentIndex - 1 + patients.length) % patients.length;
    setActivePatient(patients[nextIndex]);
  };

  const goNext = () => {
    if (!patients?.length) return;
    const nextIndex = (currentIndex + 1) % patients.length;
    setActivePatient(patients[nextIndex]);
  };

  if (!activePatient) {
    return (
      <section className="card-block side-card">
        <div className="snapshot-head">
          <h2>Doctor Review Snapshot</h2>
          <div className="snapshot-nav">
            <button type="button" className="nav-btn" onClick={goPrev} disabled={!patients?.length}>
              ▲
            </button>
            <button type="button" className="nav-btn" onClick={goNext} disabled={!patients?.length}>
              ▼
            </button>
          </div>
        </div>
        <div className="empty-box">Select a patient</div>
      </section>
    );
  }

  const percent = Math.min(Number(activePatient.riskScore || 0) <= 10
    ? (Number(activePatient.riskScore || 0) / 10) * 100
    : Number(activePatient.riskScore || 0), 100);

  return (
    <section className="card-block side-card">
      <div className="snapshot-head">
        <h2>Doctor Review Snapshot</h2>

        <div className="snapshot-nav">
          <button type="button" className="nav-btn" onClick={goPrev}>
            ▲
          </button>
          <button type="button" className="nav-btn" onClick={goNext}>
            ▼
          </button>
        </div>
      </div>

      <div className="mini-field">
        <label>Selected Patient</label>
        <strong>{activePatient.name}</strong>
      </div>

      <div className="mini-field">
        <label>Patient ID</label>
        <strong>{activePatient.patientId}</strong>
      </div>

      <div className="mini-field">
        <label>Current Risk</label>
        <strong>
          {Math.round(percent)}% ({activePatient.riskLevel})
        </strong>
      </div>

      <div className="mini-field">
        <label>Diagnosis</label>
        <strong>{activePatient.diagnosis || "Diabetes with CKD"}</strong>
      </div>

      <div className="mini-field">
        <label>Ward</label>
        <strong>{activePatient.ward || "Medicine"}</strong>
      </div>
    </section>
  );
}

export default DoctorSnapshot;