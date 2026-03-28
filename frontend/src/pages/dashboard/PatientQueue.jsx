
function PatientQueue({
  patients,
  search,
  setSearch,
  onHover,
  onSelect,
  activePatientId,
}) {
  const getDisplayScore = (patient) => {
    const value = Number(patient?.riskScore || 0);
    if (value <= 10) return `${Math.round((value / 10) * 100)}%`;
    return `${Math.round(value)}%`;
  };

  return (
    <>
      <section className="card-block">
        <div className="section-head simple-head">
          <div>
            <h2>Patient Search & Auto-Fetch</h2>
            <p>
              Enter a patient ID to fetch stored records from the hospital
              database.
            </p>
          </div>
        </div>

        <div className="fetch-row">
          <div className="fetch-input-wrap">
            <label>Patient ID</label>
            <input
              className="search-input queue-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient ID, name, ward, risk"
            />
          </div>

        </div>
      </section>

      <section className="card-block queue-block">
        <div className="section-head queue-head">
          <div>
            <h2>Patient Queue</h2>
            <p>
              Monitor all screened patients and prioritize follow-up based on
              estimated readmission risk.
            </p>
          </div>
        </div>

        <div className="queue-table">
          <div className="queue-header queue-row">
            <span>Patient ID</span>
            <span>Name</span>
            <span>Ward</span>
            <span>Diagnosis</span>
            <span>Risk Score</span>
            <span>Risk Level</span>
            <span>Last Visit</span>
          </div>

          {patients.length === 0 ? (
            <div className="queue-empty">No patients found</div>
          ) : (
            patients.map((p) => {
              const isActive = activePatientId === p._id;

              return (
                <div
                  key={p._id}
                  className={`queue-row queue-data-row ${isActive ? "active" : ""}`}
                  onMouseEnter={() => onHover?.(p)}
                  onMouseLeave={() => onHover?.(null)}
                  onClick={() => onSelect?.(p)}
                >
                  <span>{p.patientId}</span>
                  <span>{p.name}</span>
                  <span>{p.ward || "Medicine"}</span>
                  <span>{p.diagnosis || "Diabetes with CKD"}</span>
                  <span>{getDisplayScore(p)}</span>
                  <span>
                    <span
                      className={`risk-pill ${String(p.riskLevel || "").toLowerCase()}`}
                    >
                      {p.riskLevel}
                    </span>
                  </span>
                  <span>
                    {p.updatedAt
                      ? new Date(p.updatedAt).toISOString().slice(0, 10)
                      : "--"}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </section>
    </>
  );
}

export default PatientQueue;
