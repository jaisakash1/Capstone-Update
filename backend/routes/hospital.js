const express = require('express');
const router = express.Router();
const Hospital = require('../models/Hospital');

// Get hospital profile
router.get('/', async (req, res) => {
    try {
        const hospital = await Hospital.findOne().select('-password');
        if (!hospital) return res.status(404).json({ error: 'Hospital not found' });
        res.json(hospital);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update hospital profile
router.put('/', async (req, res) => {
    try {
        const hospital = await Hospital.findOne();
        if (!hospital) return res.status(404).json({ error: 'Hospital not found' });

        const { name, address, phone, emergencyContact, email, prefix } = req.body;
        if (name) hospital.name = name;
        if (address !== undefined) hospital.address = address;
        if (phone !== undefined) hospital.phone = phone;
        if (emergencyContact !== undefined) hospital.emergencyContact = emergencyContact;
        if (email !== undefined) hospital.email = email;
        if (prefix) hospital.prefix = prefix;

        await hospital.save();

        const result = hospital.toObject();
        delete result.password;
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
