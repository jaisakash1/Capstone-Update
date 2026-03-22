const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Hospital = require('../models/Hospital');
const Patient = require('../models/Patient');
const { auth, generateToken } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { id, password, role } = req.body;

        if (!id || !password || !role) {
            return res.status(400).json({ error: 'ID, password, and role are required.' });
        }

        if (role === 'hospital') {
            const hospital = await Hospital.findOne({ hospitalId: id });
            if (!hospital) {
                return res.status(401).json({ error: 'Invalid hospital ID or password.' });
            }
            const isMatch = await hospital.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid hospital ID or password.' });
            }
            const token = generateToken({ id: hospital._id, role: 'hospital' });
            return res.json({
                token,
                user: {
                    id: hospital._id,
                    hospitalId: hospital.hospitalId,
                    name: hospital.name,
                    role: 'hospital'
                }
            });
        }

        if (role === 'patient') {
            const patient = await Patient.findOne({ patientId: id });
            if (!patient) {
                return res.status(401).json({ error: 'Invalid patient ID or password.' });
            }
            const isMatch = await bcrypt.compare(password, patient.password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid patient ID or password.' });
            }
            const token = generateToken({ id: patient._id, role: 'patient' });
            return res.json({
                token,
                user: {
                    id: patient._id,
                    patientId: patient.patientId,
                    name: patient.name,
                    role: 'patient'
                }
            });
        }

        return res.status(400).json({ error: 'Invalid role. Must be "hospital" or "patient".' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/auth/me — get current user profile from token
router.get('/me', auth, async (req, res) => {
    try {
        if (req.user.role === 'hospital') {
            const hospital = await Hospital.findById(req.user.id).select('-password');
            if (!hospital) return res.status(404).json({ error: 'Hospital not found.' });
            return res.json({ ...hospital.toObject(), role: 'hospital' });
        }

        if (req.user.role === 'patient') {
            const patient = await Patient.findById(req.user.id).select('-password');
            if (!patient) return res.status(404).json({ error: 'Patient not found.' });
            return res.json({ ...patient.toObject(), role: 'patient' });
        }

        res.status(400).json({ error: 'Invalid role in token.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
