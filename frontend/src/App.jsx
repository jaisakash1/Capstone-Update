import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import NewPatient from './pages/NewPatient';
import PatientList from './pages/PatientList';
import Readmission from './pages/Readmission';
import FollowUp from './pages/FollowUp';
import NearbyHospitals from './pages/NearbyHospitals';
import Reports from './pages/Reports';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <aside className="sidebar">
          <div className="logo">
            <h1>🏥 DiabetCare</h1>
            <span>Patient Follow-up System</span>
          </div>
          <nav>
            <ul className="nav-menu">
              <li className="nav-item">
                <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <span className="nav-icon">📊</span>
                  Dashboard
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/patients" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <span className="nav-icon">👥</span>
                  All Patients
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/new-patient" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <span className="nav-icon">➕</span>
                  New Patient
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/readmission" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <span className="nav-icon">🔄</span>
                  Readmission
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/followup" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <span className="nav-icon">📋</span>
                  Follow-up
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/hospitals" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <span className="nav-icon">🏨</span>
                  Nearby Hospitals
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <span className="nav-icon">📄</span>
                  Reports
                </NavLink>
              </li>
            </ul>
          </nav>
        </aside>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/patients" element={<PatientList />} />
            <Route path="/new-patient" element={<NewPatient />} />
            <Route path="/readmission" element={<Readmission />} />
            <Route path="/followup" element={<FollowUp />} />
            <Route path="/hospitals" element={<NearbyHospitals />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
