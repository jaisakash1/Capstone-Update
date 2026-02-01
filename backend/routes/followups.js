const express = require('express');
const router = express.Router();
const FollowUp = require('../models/FollowUp');
const Patient = require('../models/Patient');

// Get all follow-ups
router.get('/', async (req, res) => {
    try {
        const { pending } = req.query;
        let query = {};

        if (pending === 'true') {
            query.isCompleted = false;
        }

        const followUps = await FollowUp.find(query)
            .populate('patient', 'name age gender')
            .sort({ scheduledDate: 1 });
        res.json(followUps);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get follow-ups for a specific patient
router.get('/patient/:patientId', async (req, res) => {
    try {
        const followUps = await FollowUp.find({ patient: req.params.patientId })
            .sort({ scheduledDate: -1 });
        res.json(followUps);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create new follow-up
router.post('/', async (req, res) => {
    try {
        const patient = await Patient.findById(req.body.patient);
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        const followUp = new FollowUp(req.body);
        await followUp.save();
        res.status(201).json(followUp);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Complete a follow-up with result
router.put('/:id/complete', async (req, res) => {
    try {
        const followUp = await FollowUp.findById(req.params.id);
        if (!followUp) {
            return res.status(404).json({ error: 'Follow-up not found' });
        }

        followUp.result = req.body.result;
        followUp.notes = req.body.notes || followUp.notes;
        followUp.isCompleted = true;
        followUp.completedDate = new Date();

        // Auto-recommend tests for abnormal results
        if (req.body.result === 'Abnormal') {
            followUp.recommendedTests = [
                'Blood Test (CBC)',
                'HbA1c Test',
                'Fasting Blood Sugar',
                'Post-meal Sugar Test',
                'ECG',
                'Kidney Function Test'
            ];
        }

        await followUp.save();
        res.json(followUp);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update follow-up
router.put('/:id', async (req, res) => {
    try {
        const followUp = await FollowUp.findById(req.params.id);
        if (!followUp) {
            return res.status(404).json({ error: 'Follow-up not found' });
        }

        Object.assign(followUp, req.body);
        await followUp.save();
        res.json(followUp);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete follow-up
router.delete('/:id', async (req, res) => {
    try {
        const followUp = await FollowUp.findByIdAndDelete(req.params.id);
        if (!followUp) {
            return res.status(404).json({ error: 'Follow-up not found' });
        }
        res.json({ message: 'Follow-up deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
