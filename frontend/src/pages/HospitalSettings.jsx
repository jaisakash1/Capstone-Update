import { useState, useEffect } from 'react';
import { hospitalAPI } from '../services/api';

function HospitalSettings() {
    const [profile, setProfile] = useState({
        name: '', address: '', phone: '', emergencyContact: '', email: '', prefix: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await hospitalAPI.getProfile();
            setProfile({
                name: res.data.name || '',
                address: res.data.address || '',
                phone: res.data.phone || '',
                emergencyContact: res.data.emergencyContact || '',
                email: res.data.email || '',
                prefix: res.data.prefix || ''
            });
        } catch (err) {
            setMessage({ type: 'danger', text: 'Failed to load hospital profile.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            await hospitalAPI.updateProfile(profile);
            setMessage({ type: 'success', text: '✅ Hospital profile updated successfully!' });
        } catch (err) {
            setMessage({ type: 'danger', text: `❌ Error: ${err.response?.data?.error || err.message}` });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Hospital Settings</h1>
                <p className="page-subtitle">Manage your hospital profile and contact information</p>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type}`} style={{ marginBottom: '16px' }}>{message.text}</div>
            )}

            <div className="card">
                <h3 style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>🏥 Hospital Profile</h3>
                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">Hospital Name *</label>
                        <input type="text" name="name" className="form-input" value={profile.name} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Patient ID Prefix</label>
                        <input type="text" name="prefix" className="form-input" value={profile.prefix} onChange={handleChange}
                            placeholder="e.g., DIABETCARE" style={{ textTransform: 'uppercase' }} />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">Address</label>
                        <input type="text" name="address" className="form-input" value={profile.address} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input type="tel" name="phone" className="form-input" value={profile.phone} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Emergency Contact</label>
                        <input type="tel" name="emergencyContact" className="form-input" value={profile.emergencyContact} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input type="email" name="email" className="form-input" value={profile.email} onChange={handleChange} />
                    </div>
                </div>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ marginTop: '24px' }}>
                    {saving ? 'Saving...' : '💾 Save Settings'}
                </button>
            </div>

            <div className="card" style={{ marginTop: '24px' }}>
                <h3 style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>ℹ️ About</h3>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                    <p>Changes to the hospital profile will be reflected throughout the system including:</p>
                    <ul style={{ marginTop: '8px', marginLeft: '20px' }}>
                        <li>Patient portal (hospital contact information)</li>
                        <li>Admission emails sent to patients</li>
                        <li>Patient ID prefix for new registrations</li>
                        <li>PDF reports</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default HospitalSettings;
