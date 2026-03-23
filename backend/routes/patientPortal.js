const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const Patient = require('../models/Patient');
const FollowUp = require('../models/FollowUp');
const Readmission = require('../models/Readmission');
const Hospital = require('../models/Hospital');
const { auth, patientOnly } = require('../middleware/auth');

// All routes require patient auth
router.use(auth, patientOnly);

// GET /api/portal/dashboard — patient's dashboard data
router.get('/dashboard', async (req, res) => {
    try {
        const patient = await Patient.findById(req.user.id)
            .select('-password -plainPassword')
            .populate('hospital', 'name address phone emergencyContact email');

        if (!patient) return res.status(404).json({ error: 'Patient not found.' });

        // Check for updates notification
        const hasUpdates = patient.lastUpdatedByHospital &&
            (!patient.lastViewedByPatient || patient.lastUpdatedByHospital > patient.lastViewedByPatient);

        // Mark as viewed
        await Patient.findByIdAndUpdate(req.user.id, { lastViewedByPatient: new Date() });

        const pendingFollowUps = await FollowUp.countDocuments({
            patient: req.user.id,
            isCompleted: false
        });
        const completedFollowUps = await FollowUp.countDocuments({
            patient: req.user.id,
            isCompleted: true
        });
        const totalReadmissions = await Readmission.countDocuments({
            patient: req.user.id
        });

        // Get next upcoming appointment
        const nextAppointment = await FollowUp.findOne({
            patient: req.user.id,
            isCompleted: false
        }).sort({ scheduledDate: 1 });

        res.json({
            patient,
            stats: {
                pendingFollowUps,
                completedFollowUps,
                totalReadmissions
            },
            nextAppointment,
            hasUpdates,
            lastUpdatedAt: patient.lastUpdatedByHospital
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/portal/download-report — generate PDF for patient
router.get('/download-report', async (req, res) => {
    try {
        const patient = await Patient.findById(req.user.id)
            .populate('hospital', 'name');
        if (!patient) return res.status(404).json({ error: 'Patient not found.' });

        const readmissions = await Readmission.find({ patient: req.user.id });
        const followUps = await FollowUp.find({ patient: req.user.id });

        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${patient.patientId}_report.pdf`);
        doc.pipe(res);

        // Header
        doc.fontSize(24).fillColor('#1a365d').text('My Health Report', { align: 'center' });
        doc.moveDown(0.3);
        doc.fontSize(11).fillColor('#666').text(`Patient: ${patient.name} (${patient.patientId})`, { align: 'center' });
        doc.fontSize(10).fillColor('#999').text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, { align: 'center' });
        doc.moveDown(1);
        doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(1);

        // Personal Info
        doc.fontSize(16).fillColor('#2d3748').text('Personal Information');
        doc.moveDown(0.5);
        doc.fontSize(11).fillColor('#4a5568');
        doc.text(`Name: ${patient.name}`);
        doc.text(`Gender: ${patient.gender} | Age: ${patient.age} years`);
        doc.text(`Phone: ${patient.phone || 'N/A'} | Email: ${patient.email || 'N/A'}`);
        doc.moveDown(1);

        // Vitals
        doc.fontSize(16).fillColor('#2d3748').text('Current Vitals & Lab Results');
        doc.moveDown(0.5);
        doc.fontSize(11).fillColor('#4a5568');
        if (patient.bloodPressure && patient.bloodPressure.systolic) {
            doc.text(`Blood Pressure: ${patient.bloodPressure.systolic}/${patient.bloodPressure.diastolic} mmHg`);
        }
        if (patient.sugarLevel) doc.text(`Sugar Level: ${patient.sugarLevel} mg/dL`);
        doc.text(`HbA1c: ${patient.hba1c} | Glucose: ${patient.glucose}`);
        doc.text(`Diabetes Medication: ${patient.diabetesMed}`);
        doc.moveDown(1);

        // Diseases
        if (patient.diseases && patient.diseases.length > 0) {
            doc.fontSize(16).fillColor('#2d3748').text('Diagnosed Conditions');
            doc.moveDown(0.5);
            doc.fontSize(11).fillColor('#4a5568');
            patient.diseases.forEach((d, i) => {
                doc.text(`${i + 1}. ${d.name} — ${d.status} (${new Date(d.diagnosedDate).toLocaleDateString('en-IN')})`);
                if (d.notes) doc.fontSize(10).fillColor('#718096').text(`   Notes: ${d.notes}`);
                doc.fontSize(11).fillColor('#4a5568');
            });
            doc.moveDown(1);
        }

        // Symptoms
        if (patient.symptoms && patient.symptoms.length > 0) {
            doc.fontSize(16).fillColor('#2d3748').text('Reported Symptoms');
            doc.moveDown(0.5);
            doc.fontSize(11).fillColor('#4a5568');
            patient.symptoms.forEach((s, i) => {
                doc.text(`${i + 1}. ${s.name} — Severity: ${s.severity} (${new Date(s.reportedDate).toLocaleDateString('en-IN')})`);
            });
            doc.moveDown(1);
        }

        // Readmissions
        if (readmissions.length > 0) {
            doc.fontSize(16).fillColor('#2d3748').text('Readmission History');
            doc.moveDown(0.5);
            doc.fontSize(11).fillColor('#4a5568');
            readmissions.forEach((r, i) => {
                doc.text(`${i + 1}. ${new Date(r.readmissionDate).toLocaleDateString('en-IN')} — ${r.reason}`);
            });
            doc.moveDown(1);
        }

        // Follow-ups
        if (followUps.length > 0) {
            doc.fontSize(16).fillColor('#2d3748').text('Follow-up Records');
            doc.moveDown(0.5);
            doc.fontSize(11).fillColor('#4a5568');
            followUps.forEach((f, i) => {
                doc.text(`${i + 1}. ${f.type} — ${f.result} (${new Date(f.scheduledDate).toLocaleDateString('en-IN')})`);
                if (f.recommendedTests && f.recommendedTests.length > 0) {
                    doc.fontSize(10).fillColor('#718096').text(`   Tests: ${f.recommendedTests.join(', ')}`);
                    doc.fontSize(11).fillColor('#4a5568');
                }
            });
            doc.moveDown(1);
        }

        // Footer
        doc.moveDown(1);
        doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);
        doc.fontSize(9).fillColor('#a0aec0').text(`${patient.hospital?.name || 'DiabetCare'} — Patient Follow-up System`, { align: 'center' });
        doc.text('This is an auto-generated report for your personal records.', { align: 'center' });

        doc.end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/portal/reports — completed follow-up reports
router.get('/reports', async (req, res) => {
    try {
        const reports = await FollowUp.find({
            patient: req.user.id,
            isCompleted: true
        }).sort({ completedDate: -1 });

        res.json(reports);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/portal/pending-reports — pending follow-ups
router.get('/pending-reports', async (req, res) => {
    try {
        const pending = await FollowUp.find({
            patient: req.user.id,
            isCompleted: false
        }).sort({ scheduledDate: 1 });

        res.json(pending);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/portal/diseases — patient's diseases
router.get('/diseases', async (req, res) => {
    try {
        const patient = await Patient.findById(req.user.id).select('diseases');
        if (!patient) return res.status(404).json({ error: 'Patient not found.' });
        res.json(patient.diseases || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/portal/symptoms — patient's symptoms
router.get('/symptoms', async (req, res) => {
    try {
        const patient = await Patient.findById(req.user.id).select('symptoms');
        if (!patient) return res.status(404).json({ error: 'Patient not found.' });
        res.json(patient.symptoms || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/portal/appointments — all follow-up appointments
router.get('/appointments', async (req, res) => {
    try {
        const appointments = await FollowUp.find({
            patient: req.user.id
        }).sort({ scheduledDate: -1 });

        res.json(appointments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
