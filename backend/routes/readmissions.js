const express = require('express');
const router = express.Router();
const Readmission = require('../models/Readmission');
const Patient = require('../models/Patient');

// Get all readmissions
router.get('/', async (req, res) => {
    try {
        const readmissions = await Readmission.find()
            .populate('patient', 'name age gender')
            .sort({ readmissionDate: -1 });
        res.json(readmissions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get readmissions for a specific patient
router.get('/patient/:patientId', async (req, res) => {
    try {
        const readmissions = await Readmission.find({ patient: req.params.patientId })
            .sort({ readmissionDate: -1 });
        res.json(readmissions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create new readmission
router.post('/', async (req, res) => {
    try {
        const patient = await Patient.findById(req.body.patient);
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        const readmission = new Readmission(req.body);
        await readmission.save();

        // Update patient's inpatient visits
        patient.inpatientVisits += 1;
        await patient.save();

        res.status(201).json(readmission);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update readmission
router.put('/:id', async (req, res) => {
    try {
        const readmission = await Readmission.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!readmission) {
            return res.status(404).json({ error: 'Readmission not found' });
        }
        res.json(readmission);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete readmission
router.delete('/:id', async (req, res) => {
    try {
        const readmission = await Readmission.findByIdAndDelete(req.params.id);
        if (!readmission) {
            return res.status(404).json({ error: 'Readmission not found' });
        }
        res.json({ message: 'Readmission deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
