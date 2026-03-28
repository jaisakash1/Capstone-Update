const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    // Login credentials
    patientId: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    password: {
        type: String
    },
    plainPassword: {
        type: String
    },
    hospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital'
    },
    email: {
        type: String,
        trim: true,
        default: ''
    },
    lastUpdatedByHospital: {
        type: Date,
        default: null
    },
    lastViewedByPatient: {
        type: Date,
        default: null
    },

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

    // Diseases
    diseases: [{
        name: { type: String, required: true },
        diagnosedDate: { type: Date, default: Date.now },
        status: {
            type: String,
            enum: ['Active', 'Managed', 'Resolved'],
            default: 'Active'
        },
        notes: { type: String, default: '' }
    }],

    // Symptoms
    symptoms: [{
        name: { type: String, required: true },
        severity: {
            type: String,
            enum: ['Mild', 'Moderate', 'Severe'],
            default: 'Mild'
        },
        reportedDate: { type: Date, default: Date.now },
        notes: { type: String, default: '' }
    }],

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
    },


    riskScore: {
    type: Number,
    default: 0
    },
    riskLevel: {
        type: String,
        enum: ['Low', 'Moderate', 'High'],
        default: 'Low'
    },
    recommendedAction: {
        type: String,
        default: ''
    },
});

// Pre-save middleware to check eligibility
patientSchema.pre('save', function (next) {
    this.updatedAt = Date.now();

    let score = 0;

    // 🩺 Diabetes condition (already patient in system)
    if (this.diabetesMed === 'Yes') score += 1;

    // 🍬 Sugar Level
    if (this.sugarLevel >= 200) score += 2;
    else if (this.sugarLevel >= 140) score += 1;

    // 🧪 HbA1c
    if (this.hba1c === 'Abnormal') score += 2;

    // 🏥 Past admissions (proxy)
    if (this.inpatientVisits > 1) score += 1;

    // ⏳ Stay duration
    if (this.timeInHospital > 7) score += 1;

    // 🚑 Emergency visits
    if (this.emergencyVisits > 2) score += 2;
    else if (this.emergencyVisits > 0) score += 1;

    // 🌡️ Symptoms severity
    if (this.symptoms && this.symptoms.length > 0) {
        this.symptoms.forEach(s => {
            if (s.severity === 'Severe') score += 2;
            else if (s.severity === 'Moderate') score += 1;
        });
    }

    // 🦠 Diseases
    if (this.diseases && this.diseases.length > 0) {
        this.diseases.forEach(d => {
            if (d.status === 'Active') score += 1;
        });
    }

    // ❤️ Blood Pressure
    if (this.bloodPressure?.systolic > 140 || this.bloodPressure?.diastolic > 90) {
        score += 1;
    }

    // 👴 Age factor
    if (this.age > 60) score += 1;

    this.riskScore = score;

    if (score <= 2) {
        this.riskLevel = 'Low';
        this.recommendedAction = 'Routine discharge. Standard OPD follow-up.';
        this.isEligible = false; // low readmission
        this.eliminationReason = 'Low risk patient';
    } else if (score <= 5) {
        this.riskLevel = 'Moderate';
        this.recommendedAction = 'Follow-up in 7–14 days. Reinforce diet and medication advice.';
        this.isEligible = false;
        this.eliminationReason = 'Moderate risk patient';
    } else {
        this.riskLevel = 'High';
        this.recommendedAction = 'Follow-up in 3–7 days. Counseling + medication review.';
        this.isEligible = true; // 🔥 high readmission chance
        this.eliminationReason = null;
    }

    next();
});

module.exports = mongoose.model('Patient', patientSchema);
