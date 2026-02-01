const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');

// Get all patients
router.get('/', async (req, res) => {
    try {
        const { eligible, search } = req.query;
        let query = {};

        if (eligible !== undefined) {
            query.isEligible = eligible === 'true';
        }

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const patients = await Patient.find(query).sort({ createdAt: -1 });
        res.json(patients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single patient
router.get('/:id', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        res.json(patient);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create new patient
router.post('/', async (req, res) => {
    try {
        const patient = new Patient(req.body);
        await patient.save();
        res.status(201).json(patient);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update patient
router.put('/:id', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        Object.assign(patient, req.body);
        await patient.save();
        res.json(patient);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete patient
router.delete('/:id', async (req, res) => {
    try {
        const patient = await Patient.findByIdAndDelete(req.params.id);
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        res.json({ message: 'Patient deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get dashboard stats
router.get('/stats/dashboard', async (req, res) => {
    try {
        const total = await Patient.countDocuments();
        const eligible = await Patient.countDocuments({ isEligible: true });
        const pending = await Patient.countDocuments({ hba1c: 'Pending' });
        const abnormalA1c = await Patient.countDocuments({ hba1c: 'Abnormal' });

        res.json({
            totalPatients: total,
            eligiblePatients: eligible,
            pendingLabReports: pending,
            abnormalA1c: abnormalA1c
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
