const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/diabetes_followup')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/readmissions', require('./routes/readmissions'));
app.use('/api/followups', require('./routes/followups'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/portal', require('./routes/patientPortal'));
app.use('/api/hospital', require('./routes/hospital'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Seed default hospital account
const seedHospital = async () => {
    try {
        const Hospital = require('./models/Hospital');
        const existing = await Hospital.findOne({ hospitalId: 'HOSP001' });
        if (!existing) {
            await Hospital.create({
                hospitalId: 'HOSP001',
                password: 'admin123',
                name: 'DiabetCare Hospital',
                address: '123 Medical Avenue, Healthcare District',
                phone: '+91 98765 43210',
                emergencyContact: '+91 98765 43211',
                email: 'contact@diabetcare.com',
                prefix: 'DIABETCARE'
            });
            console.log('🏥 Default hospital seeded: HOSP001 / admin123');
        }
    } catch (err) {
        console.error('Error seeding hospital:', err.message);
    }
};

mongoose.connection.once('open', () => {
    seedHospital();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🏥 Server running on port ${PORT}`);
});
