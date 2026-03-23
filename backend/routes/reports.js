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
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const totalPatients = await Patient.countDocuments();
        const patientsVisitedThisMonth = await Patient.countDocuments({
            createdAt: { $gte: startOfMonth }
        });
        const readmissionsThisMonth = await Readmission.countDocuments({
            readmissionDate: { $gte: startOfMonth }
        });
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
            patientsVisitedThisMonth,
            readmissionsThisMonth,
            pendingFollowUps,
            abnormalResults,
            ageGroups
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Get chart data for visualizations
router.get('/charts', async (req, res) => {
    try {
        // HbA1c distribution
        const hba1cDist = await Patient.aggregate([
            { $group: { _id: '$hba1c', count: { $sum: 1 } } }
        ]);

        // Monthly admissions (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const monthlyAdmissions = await Patient.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Age group distribution
        const ageGroups = await Patient.aggregate([
            {
                $bucket: {
                    groupBy: '$age',
                    boundaries: [0, 20, 30, 40, 50, 60, 70, 80, 120],
                    default: '80+',
                    output: { count: { $sum: 1 } }
                }
            }
        ]);

        // Gender distribution
        const genderDist = await Patient.aggregate([
            { $group: { _id: '$gender', count: { $sum: 1 } } }
        ]);

        // Follow-up results distribution
        const followUpDist = await FollowUp.aggregate([
            { $group: { _id: '$result', count: { $sum: 1 } } }
        ]);

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        res.json({
            hba1cDistribution: hba1cDist.map(d => ({ name: d._id || 'Unknown', value: d.count })),
            monthlyAdmissions: monthlyAdmissions.map(d => ({
                month: `${monthNames[d._id.month - 1]} ${d._id.year}`,
                patients: d.count
            })),
            ageGroups: ageGroups.map(d => ({
                range: d._id === '80+' ? '80+' : `${d._id}-${d._id + 9}`,
                count: d.count
            })),
            genderDistribution: genderDist.map(d => ({ name: d._id || 'Unknown', value: d.count })),
            followUpResults: followUpDist.map(d => ({ name: d._id || 'Unknown', value: d.count }))
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
