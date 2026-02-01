const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const Patient = require('../models/Patient');
const Readmission = require('../models/Readmission');
const FollowUp = require('../models/FollowUp');

// Generate PDF report for a patient
router.get('/patient/:patientId', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.patientId);
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        const readmissions = await Readmission.find({ patient: req.params.patientId });
        const followUps = await FollowUp.find({ patient: req.params.patientId });

        // Create PDF
        const doc = new PDFDocument({ margin: 50 });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=patient_${patient._id}_report.pdf`);

        doc.pipe(res);

        // Header
        doc.fontSize(24).fillColor('#1a365d').text('Patient Health Report', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor('#666').text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
        doc.moveDown(1);

        // Divider
        doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(1);

        // Patient Info Section
        doc.fontSize(16).fillColor('#2d3748').text('Patient Information');
        doc.moveDown(0.5);
        doc.fontSize(11).fillColor('#4a5568');
        doc.text(`Name: ${patient.name}`);
        doc.text(`Gender: ${patient.gender}`);
        doc.text(`Age: ${patient.age} years`);
        doc.text(`Phone: ${patient.phone || 'N/A'}`);
        doc.moveDown(1);

        // Hospital Visit Info
        doc.fontSize(16).fillColor('#2d3748').text('Hospital Visit History');
        doc.moveDown(0.5);
        doc.fontSize(11).fillColor('#4a5568');
        doc.text(`Days in Hospital: ${patient.timeInHospital}`);
        doc.text(`Emergency Visits: ${patient.emergencyVisits}`);
        doc.text(`Inpatient Visits: ${patient.inpatientVisits}`);
        doc.moveDown(1);

        // Lab Reports Section
        doc.fontSize(16).fillColor('#2d3748').text('Lab Reports');
        doc.moveDown(0.5);
        doc.fontSize(11).fillColor('#4a5568');
        doc.text(`HbA1c Result: ${patient.hba1c}`);
        doc.text(`Glucose Result: ${patient.glucose}`);
        if (patient.bloodPressure && patient.bloodPressure.systolic) {
            doc.text(`Blood Pressure: ${patient.bloodPressure.systolic}/${patient.bloodPressure.diastolic} mmHg`);
        }
        if (patient.sugarLevel) {
            doc.text(`Sugar Level: ${patient.sugarLevel} mg/dL`);
        }
        doc.moveDown(1);

        // Medication & Eligibility
        doc.fontSize(16).fillColor('#2d3748').text('Medication & Eligibility');
        doc.moveDown(0.5);
        doc.fontSize(11).fillColor('#4a5568');
        doc.text(`On Diabetes Medication: ${patient.diabetesMed}`);
        doc.text(`Program Eligibility: ${patient.isEligible ? '✅ Eligible' : '❌ Not Eligible'}`);
        if (!patient.isEligible && patient.eliminationReason) {
            doc.fillColor('#e53e3e').text(`Reason: ${patient.eliminationReason}`);
        }
        doc.moveDown(1);

        // Readmissions Section
        if (readmissions.length > 0) {
            doc.fontSize(16).fillColor('#2d3748').text('Readmission History');
            doc.moveDown(0.5);
            doc.fontSize(11).fillColor('#4a5568');
            readmissions.forEach((r, index) => {
                doc.text(`${index + 1}. ${new Date(r.readmissionDate).toLocaleDateString()} - ${r.reason}`);
            });
            doc.moveDown(1);
        }

        // Follow-ups Section
        if (followUps.length > 0) {
            doc.fontSize(16).fillColor('#2d3748').text('Follow-up Records');
            doc.moveDown(0.5);
            doc.fontSize(11).fillColor('#4a5568');
            followUps.forEach((f, index) => {
                doc.text(`${index + 1}. ${f.type} Follow-up - ${f.result} (${new Date(f.scheduledDate).toLocaleDateString()})`);
                if (f.recommendedTests && f.recommendedTests.length > 0) {
                    doc.fontSize(10).fillColor('#718096');
                    doc.text(`   Recommended Tests: ${f.recommendedTests.join(', ')}`);
                }
            });
            doc.moveDown(1);
        }

        // Footer
        doc.moveDown(2);
        doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);
        doc.fontSize(9).fillColor('#a0aec0').text('Diabetes Patient Follow-up System', { align: 'center' });
        doc.text('This report is generated automatically.', { align: 'center' });

        doc.end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get summary report for all patients
router.get('/summary', async (req, res) => {
    try {
        const totalPatients = await Patient.countDocuments();
        const eligiblePatients = await Patient.countDocuments({ isEligible: true });
        const totalReadmissions = await Readmission.countDocuments();
        const pendingFollowUps = await FollowUp.countDocuments({ isCompleted: false });
        const abnormalResults = await FollowUp.countDocuments({ result: 'Abnormal' });

        const ageGroups = await Patient.aggregate([
            {
                $bucket: {
                    groupBy: '$age',
                    boundaries: [0, 30, 50, 70, 100],
                    default: '100+',
                    output: { count: { $sum: 1 } }
                }
            }
        ]);

        res.json({
            totalPatients,
            eligiblePatients,
            ineligiblePatients: totalPatients - eligiblePatients,
            totalReadmissions,
            pendingFollowUps,
            abnormalResults,
            ageGroups
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
