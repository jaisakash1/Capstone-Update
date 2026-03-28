import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Login from './pages/Login';
import NewPatient from './pages/NewPatient';
import PatientDetail from './pages/PatientDetail';
import Dashboard from './pages/Dashboard';
import Readmission from './pages/Readmission';
import FollowUp from './pages/FollowUp';
import NearbyHospitals from './pages/NearbyHospitals';
import Reports from './pages/Reports';
import HospitalSettings from './pages/HospitalSettings';
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientReports from './pages/patient/PatientReports';
import PatientPendingReports from './pages/patient/PatientPendingReports';
import PatientDiseases from './pages/patient/PatientDiseases';
import PatientSymptoms from './pages/patient/PatientSymptoms';
import PatientAppointments from './pages/patient/PatientAppointments';
import './App.css';

function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    return (
        <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? '☀️' : '🌙'}
        </button>
    );
}

function HospitalLayout() {
    const { logout, user } = useAuth();

    return (
        <div className="app-container bgwhite">
            <aside className="sidebar bgwhite">
                <div className="logo bgwhite">
                    <h1>🏥 DiabetCare</h1>
                    <span>Hospital Management</span>
                </div>
                <nav className='bgwhite hww'>
                    <ul className="nav-menu bgwhite">
                        <li className="nav-item">
                            <NavLink to="/patients" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <span className="nav-icon">👥</span> Dashboard
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/new-patient" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <span className="nav-icon">➕</span> New Patient
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/readmission" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <span className="nav-icon">🔄</span> Readmission
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/followup" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <span className="nav-icon">📋</span> Follow-up
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/hospitals" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <span className="nav-icon">🏨</span> Nearby Hospitals
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <span className="nav-icon">📄</span> Reports
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <span className="nav-icon">⚙️</span> Settings
                            </NavLink>
                        </li>
                    </ul>
                </nav>
                <div className="sidebar-footer bgwhite">
                    {/* <ThemeToggle /> */}
                    <div className="user-info bgwhite">
                        <span className="user-name bgwhite">🏥 {user?.name || 'Hospital'}</span>
                        <span className="user-id bgwhite">{user?.hospitalId}</span>
                    </div>
                    <button className="logout-btn" onClick={logout}>Logout</button>
                </div>
            </aside>
            <main className="main-content bgwhite">
                <Routes>
                    <Route path="/patients" element={<Dashboard />} />
                    <Route path="/patients/:id" element={<PatientDetail />} />
                    <Route path="/new-patient" element={<NewPatient />} />
                    <Route path="/readmission" element={<Readmission />} />
                    <Route path="/followup" element={<FollowUp />} />
                    <Route path="/hospitals" element={<NearbyHospitals />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/settings" element={<HospitalSettings />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </main>
        </div>
    );
}

function PatientLayout() {
    const { logout, user } = useAuth();

    return (
        <div className="app-container bgwhite">
            <aside className="sidebar patient-sidebar bgwhite">
                <div className="logo">
                    <h1>🏥 DiabetCare</h1>
                    <span>Patient Portal</span>
                </div>
                <nav>
                    <ul className="nav-menu bgwhite hww">
                        <li className="nav-item">
                            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
                                <span className="nav-icon">🏠</span> Dashboard
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <span className="nav-icon">📄</span> Reports
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/pending" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <span className="nav-icon">⏳</span> Pending Reports
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/diseases" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <span className="nav-icon">🩺</span> Conditions
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/symptoms" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <span className="nav-icon">🌡️</span> Symptoms
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/appointments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <span className="nav-icon">📅</span> Appointments
                            </NavLink>
                        </li>
                    </ul>
                </nav>
                <div className="sidebar-footer">
                    {/* <ThemeToggle /> */}
                    <div className="user-info">
                        <span className="user-name">👤 {user?.name || 'Patient'}</span>
                        <span className="user-id">{user?.patientId}</span>
                    </div>
                    <button className="logout-btn" onClick={logout}>Logout</button>
                </div>
            </aside>
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<PatientDashboard />} />
                    <Route path="/reports" element={<PatientReports />} />
                    <Route path="/pending" element={<PatientPendingReports />} />
                    <Route path="/diseases" element={<PatientDiseases />} />
                    <Route path="/symptoms" element={<PatientSymptoms />} />
                    <Route path="/appointments" element={<PatientAppointments />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </main>
        </div>
    );
}

function AppContent() {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) return <Login />;
    if (user?.role === 'patient') return <PatientLayout />;
    return <HospitalLayout />;
}

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <AppContent />
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
