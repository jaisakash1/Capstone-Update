import { useEffect, useMemo, useState } from "react";
import { patientAPI } from "../services/api";

import StatsCards from "./dashboard/StatsCards";
import PatientQueue from "./dashboard/PatientQueue";
import DoctorSnapshot from "./dashboard/DoctorSnapshot";
import PatientSearchResultPanel from "./dashboard/PatientSearchResultPanel";
import PatientProfileSummary from "./dashboard/PatientProfileSummary";
import RiskOutputPanel from "./dashboard/RiskOutputPanel";
import RiskDriversPanel from "./dashboard/RiskDriversPanel";
import ClinicalActionPanel from "./dashboard/ClinicalActionPanel";

import "./dashboard/dashboard.css";

function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [hoveredPatient, setHoveredPatient] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [health, setHealth] = useState("DOWN");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await patientAPI.getAll();
        const list = Array.isArray(res.data) ? res.data : [];
        setPatients(list);

        if (list.length > 0) {
          setSelectedPatient(list[0]);
          setHoveredPatient(list[0]);
        }
      } catch (err) {
        console.error(err);
      }
    };

    const fetchHealth = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/health");
        const data = await res.json();
        setHealth(data?.status === "OK" ? "OK" : "DOWN");
      } catch {
        setHealth("DOWN");
      }
    };

    fetchPatients();
    fetchHealth();
  }, []);

  const filteredPatients = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return patients;

    return patients.filter((p) => {
      const fields = [
        p.patientId,
        p.name,
        p.ward,
        p.diagnosis,
        p.riskLevel,
        p.hba1c,
        p.glucose,
      ];

      return fields.some((v) =>
        String(v ?? "")
          .toLowerCase()
          .includes(q),
      );
    });
  }, [patients, search]);

  const activePatient = hoveredPatient || selectedPatient;

  const highCount = patients.filter((p) => p.riskLevel === "High").length;
  const moderateCount = patients.filter(
    (p) => p.riskLevel === "Moderate",
  ).length;
  const lowCount = patients.filter((p) => p.riskLevel === "Low").length;

  const handleSelect = (patient) => {
    setSelectedPatient(patient);
    setHoveredPatient(patient);
    setShowDetails(true);
  };

  const handleHover = (patient) => {
    if (patient) setHoveredPatient(patient);
  };

  const handleBack = () => {
    setShowDetails(false);
  };

  return (
    <div className="dashboard-shell">
      <div className="dashboard-page">
        <header className="top-hero-row">
          <div className="hero-card hero-main">
            <div className="hero-title-row">
              <span className="hero-icon">♡</span>
              <div>
                <h1>Hospital Readmission Risk Dashboard</h1>
                <p>
                  Auto-fetch patient records, update discharge factors, generate
                  ML-ready readmission risk, and support clinical action
                  planning.
                </p>
              </div>
            </div>
          </div>

          <div className="hero-card hero-mini">
            <div className="mini-label">Data Source</div>
            <div className="mini-value">Stored EHR / Hospital Records</div>
          </div>

          <div className="hero-card hero-mini">
            <div className="mini-label">System Status</div>
            <div className="mini-value">
              {health === "OK"
                ? "Database Connected / ML Ready"
                : "Database Offline"}
            </div>
          </div>
        </header>

        <div className="panel-switch-row">
          <div className="panel-switch active">Patient / Nurse Panel</div>
          <div className="panel-switch">Doctor / Admin Panel</div>
        </div>

        <StatsCards
          highCount={highCount}
          moderateCount={moderateCount}
          lowCount={lowCount}
          queueCount={patients.length}
        />

        <section className="workspace-grid">
          <div className="left-stack">
            {!showDetails ? (
              <PatientQueue
                patients={filteredPatients}
                search={search}
                setSearch={setSearch}
                onHover={handleHover}
                onSelect={handleSelect}
                activePatientId={activePatient?._id}
              />
            ) : (
              <>
                <PatientSearchResultPanel
                  patient={selectedPatient}
                  onBack={handleBack}
                />
                <PatientProfileSummary patient={selectedPatient} />
              </>
            )}
          </div>

          <div className="right-stack">
            {!showDetails ? (
              // ✅ DEFAULT VIEW
              <DoctorSnapshot
                patients={
                  filteredPatients.length > 0 ? filteredPatients : patients
                }
                activePatient={activePatient}
                setActivePatient={setHoveredPatient}
              />
            ) : (
              // ✅ CLICKED VIEW
              <>
                <RiskOutputPanel patient={selectedPatient} />
                <RiskDriversPanel patient={selectedPatient} />
                <ClinicalActionPanel patient={selectedPatient} />
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
