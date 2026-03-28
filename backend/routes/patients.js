const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Patient = require('../models/Patient');
const Hospital = require('../models/Hospital');
const FollowUp = require('../models/FollowUp');
const { sendAdmissionEmail } = require('../utils/email');

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

        const patients = await Patient.find(query)
            .select('-password -plainPassword')
            .sort({ createdAt: -1 });
        res.json(patients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Get critical patients — abnormal results or overdue follow-ups
router.get('/stats/critical', async (req, res) => {
    try {
        // Patients with abnormal HbA1c
        const abnormalPatients = await Patient.find({ hba1c: 'Abnormal' })
            .select('name patientId age hba1c glucose createdAt')
            .sort({ createdAt: -1 })
            .limit(10);

        // Overdue follow-ups
        const overdueFollowUps = await FollowUp.find({
            isCompleted: false,
            scheduledDate: { $lt: new Date() }
        })
            .populate('patient', 'name patientId age')
            .sort({ scheduledDate: 1 })
            .limit(10);

        res.json({ abnormalPatients, overdueFollowUps });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get patient credentials (hospital-only)
router.get('/:id/credentials', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id).select('patientId plainPassword name email');
        if (!patient) return res.status(404).json({ error: 'Patient not found' });

        res.json({
            patientId: patient.patientId,
            password: patient.plainPassword,
            name: patient.name,
            email: patient.email
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single patient
router.get('/:id', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id)
            .select('-password -plainPassword')
            .populate('hospital', 'name');
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        res.json(patient);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create new patient — auto-generates login credentials + optional email
router.post('/', async (req, res) => {
    try {
        let hospital = await Hospital.findOne();
        if (!hospital) {
            return res.status(500).json({ error: 'No hospital configured. Please seed the database.' });
        }

        hospital.patientCounter += 1;
        await hospital.save();

        const paddedNum = String(hospital.patientCounter).padStart(5, '0');
        const patientId = `${hospital.prefix}-${paddedNum}`;

        const plainPassword = String(Math.floor(10000 + Math.random() * 90000));
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        const patient = new Patient({
            ...req.body,
            patientId,
            password: hashedPassword,
            plainPassword,
            hospital: hospital._id
        });
        await patient.save();

        // Send admission email if email provided
        let emailResult = { sent: false };
        if (req.body.email) {
            emailResult = await sendAdmissionEmail(
                req.body.email,
                req.body.name,
                patientId,
                plainPassword,
                hospital.name
            );
        }

        const patientObj = patient.toObject();
        delete patientObj.password;
        delete patientObj.plainPassword;

        res.status(201).json({
            ...patientObj,
            credentials: {
                patientId,
                password: plainPassword
            },
            emailSent: emailResult.sent
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Reset patient password
router.post('/:id/reset-password', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) return res.status(404).json({ error: 'Patient not found' });

        const newPlainPassword = String(Math.floor(10000 + Math.random() * 90000));
        const hashedPassword = await bcrypt.hash(newPlainPassword, 10);

        patient.password = hashedPassword;
        patient.plainPassword = newPlainPassword;
        await patient.save();

        // Optionally email new password
        if (patient.email) {
            const hospital = await Hospital.findById(patient.hospital);
            const { sendAdmissionEmail: sendEmail } = require('../utils/email');
            await sendEmail(
                patient.email,
                patient.name,
                patient.patientId,
                newPlainPassword,
                hospital?.name || 'DiabetCare Hospital'
            );
        }

        res.json({
            message: 'Password reset successfully',
            credentials: {
                patientId: patient.patientId,
                password: newPlainPassword
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update patient — full edit (vitals, diseases, symptoms, info)
router.put('/:id', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        // Don't allow overwriting credentials via update
        const { patientId, password, plainPassword, ...updateData } = req.body;
        Object.assign(patient, updateData);
        patient.lastUpdatedByHospital = new Date();
        await patient.save();

        const patientObj = patient.toObject();
        delete patientObj.password;
        delete patientObj.plainPassword;
        res.json(patientObj);
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

// Add disease to patient
router.post('/:id/diseases', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) return res.status(404).json({ error: 'Patient not found' });

        patient.diseases.push(req.body);
        patient.lastUpdatedByHospital = new Date();
        await patient.save();

        const patientObj = patient.toObject();
        delete patientObj.password;
        delete patientObj.plainPassword;
        res.json(patientObj.diseases);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete disease from patient
router.delete('/:id/diseases/:diseaseIndex', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) return res.status(404).json({ error: 'Patient not found' });

        const idx = parseInt(req.params.diseaseIndex);
        if (idx < 0 || idx >= patient.diseases.length) {
            return res.status(400).json({ error: 'Invalid disease index' });
        }
        patient.diseases.splice(idx, 1);
        patient.lastUpdatedByHospital = new Date();
        await patient.save();

        res.json(patient.diseases);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Add symptom to patient
router.post('/:id/symptoms', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) return res.status(404).json({ error: 'Patient not found' });

        patient.symptoms.push(req.body);
        patient.lastUpdatedByHospital = new Date();
        await patient.save();

        const patientObj = patient.toObject();
        delete patientObj.password;
        delete patientObj.plainPassword;
        res.json(patientObj.symptoms);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete symptom from patient
router.delete('/:id/symptoms/:symptomIndex', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) return res.status(404).json({ error: 'Patient not found' });

        const idx = parseInt(req.params.symptomIndex);
        if (idx < 0 || idx >= patient.symptoms.length) {
            return res.status(400).json({ error: 'Invalid symptom index' });
        }
        patient.symptoms.splice(idx, 1);
        patient.lastUpdatedByHospital = new Date();
        await patient.save();

        res.json(patient.symptoms);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
