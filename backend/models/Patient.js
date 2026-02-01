const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    // Basic Info
    name: {
        type: String,
        required: true,
        trim: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    age: {
        type: Number,
        required: true,
        min: 0,
        max: 150
    },
    phone: {
        type: String,
        trim: true
    },

    // Hospital Visit Info
    timeInHospital: {
        type: Number,
        required: true,
        min: 0
    },
    emergencyVisits: {
        type: Number,
        default: 0,
        min: 0
    },
    inpatientVisits: {
        type: Number,
        default: 0,
        min: 0
    },

    // Lab Reports
    hba1c: {
        type: String,
        enum: ['Normal', 'Abnormal', 'Unknown', 'Pending'],
        default: 'Pending'
    },
    glucose: {
        type: String,
        enum: ['Normal', 'Abnormal', 'Unknown', 'Pending'],
        default: 'Pending'
    },

    // Vitals
    bloodPressure: {
        systolic: { type: Number },
        diastolic: { type: Number }
    },
    sugarLevel: {
        type: Number
    },

    // Medication
    diabetesMed: {
        type: String,
        enum: ['Yes', 'No'],
        required: true
    },

    // Eligibility
    isEligible: {
        type: Boolean,
        default: false
    },
    eliminationReason: {
        type: String,
        default: null
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save middleware to check eligibility
patientSchema.pre('save', function (next) {
    this.updatedAt = Date.now();

    // Eligibility Check (matching C++ logic)
    this.isEligible = true;
    this.eliminationReason = null;

    if (this.timeInHospital < 2) {
        this.isEligible = false;
        this.eliminationReason = 'Stay too short (less than 2 days)';
    } else if (this.emergencyVisits > 3) {
        this.isEligible = false;
        this.eliminationReason = 'Too many emergency visits (more than 3)';
    } else if (this.diabetesMed === 'No') {
        this.isEligible = false;
        this.eliminationReason = 'Not on diabetes medication';
    } else if (this.hba1c === 'Normal') {
        this.isEligible = false;
        this.eliminationReason = 'A1C is normal (low priority)';
    }

    next();
});

module.exports = mongoose.model('Patient', patientSchema);
