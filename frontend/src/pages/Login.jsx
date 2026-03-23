import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Login() {
    const { login } = useAuth();
    const [role, setRole] = useState('hospital');
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(id, password, role);
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <div className="login-logo">🏥</div>
                    <h1 className="login-title">DiabetCare</h1>
                    <p className="login-subtitle">Patient Follow-up System</p>
                </div>

                <div className="login-role-tabs">
                    <button
                        className={`login-role-tab ${role === 'hospital' ? 'active' : ''}`}
                        onClick={() => { setRole('hospital'); setError(''); }}
                        type="button"
                    >
                        <span>🏥</span> Hospital Staff
                    </button>
                    <button
                        className={`login-role-tab ${role === 'patient' ? 'active' : ''}`}
                        onClick={() => { setRole('patient'); setError(''); }}
                        type="button"
                    >
                        <span>👤</span> Patient
                    </button>
                </div>

                {error && (
                    <div className="login-error">
                        <span>⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-field">
                        <label>{role === 'hospital' ? 'Hospital ID' : 'Patient ID'}</label>
                        <input
                            type="text"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            placeholder={role === 'hospital' ? 'e.g. HOSP001' : 'e.g. DIABETCARE-00001'}
                            required
                            autoComplete="username"
                        />
                    </div>
                    <div className="login-field">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={role === 'hospital' ? 'Enter password' : '5-digit PIN'}
                            required
                            autoComplete="current-password"
                        />
                    </div>
                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="login-footer">
                    <p>
                        {role === 'patient'
                            ? 'Use the ID and password provided by your hospital.'
                            : 'Contact admin if you forgot your credentials.'
                        }
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
