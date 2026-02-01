import { useState } from 'react';

const hospitals = {
    govt: [
        { name: 'Government General Hospital', distance: '0.8 km', address: '123 Main Street', type: 'Govt' },
        { name: 'District Medical Center', distance: '1.2 km', address: '456 Health Avenue', type: 'Govt' },
        { name: 'State Diabetes Center', distance: '1.8 km', address: '789 Care Road', type: 'Govt' },
        { name: 'Public Health Institute', distance: '2.0 km', address: '321 Medical Lane', type: 'Govt' },
    ],
    private: [
        { name: 'Apollo Diabetes Clinic', distance: '0.5 km', address: '100 Premium Plaza', type: 'Private' },
        { name: 'Max Healthcare', distance: '1.0 km', address: '200 Elite Tower', type: 'Private' },
        { name: 'Fortis Endocrine Center', distance: '1.5 km', address: '300 Care Complex', type: 'Private' },
        { name: 'Medanta Diabetes Wing', distance: '1.9 km', address: '400 Health Hub', type: 'Private' },
    ]
};

function NearbyHospitals() {
    const [filter, setFilter] = useState('all');

    const getHospitals = () => {
        if (filter === 'govt') return hospitals.govt;
        if (filter === 'private') return hospitals.private;
        return [...hospitals.govt, ...hospitals.private].sort((a, b) =>
            parseFloat(a.distance) - parseFloat(b.distance)
        );
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Nearby Hospitals</h1>
                <p className="page-subtitle">Find diabetes care centers within 2km</p>
            </div>

            <div className="tabs" style={{ marginBottom: '24px' }}>
                <button
                    className={`tab ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    🏥 All Hospitals
                </button>
                <button
                    className={`tab ${filter === 'govt' ? 'active' : ''}`}
                    onClick={() => setFilter('govt')}
                >
                    🏛️ Government
                </button>
                <button
                    className={`tab ${filter === 'private' ? 'active' : ''}`}
                    onClick={() => setFilter('private')}
                >
                    🏨 Private
                </button>
            </div>

            <div className="hospitals-grid">
                {getHospitals().map((hospital, index) => (
                    <div key={index} className="hospital-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h4>{hospital.name}</h4>
                            <span className={`badge ${hospital.type === 'Govt' ? 'badge-info' : 'badge-success'}`}>
                                {hospital.type}
                            </span>
                        </div>
                        <p style={{ marginTop: '8px' }}>📍 {hospital.address}</p>
                        <div style={{
                            marginTop: '16px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{
                                fontSize: '1.25rem',
                                fontWeight: '600',
                                color: 'var(--accent-primary)'
                            }}>
                                {hospital.distance}
                            </span>
                            <button className="btn btn-sm btn-outline">
                                🗺️ Get Directions
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card" style={{ marginTop: '32px' }}>
                <h3 style={{ marginBottom: '16px' }}>💡 Quick Tips</h3>
                <ul style={{ color: 'var(--text-secondary)', marginLeft: '20px' }}>
                    <li>Government hospitals often have specialized diabetes clinics with lower costs</li>
                    <li>Private hospitals may offer faster appointments and more amenities</li>
                    <li>Always carry your medical records and previous test reports</li>
                    <li>Call ahead to confirm availability of endocrinologists</li>
                </ul>
            </div>
        </div>
    );
}

export default NearbyHospitals;
