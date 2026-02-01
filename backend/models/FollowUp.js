const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    type: {
        type: String,
        enum: ['7day', '30day', '90day'],
        required: true
    },
    result: {
        type: String,
        enum: ['Normal', 'Abnormal', 'Pending'],
        default: 'Pending'
    },
    recommendedTests: [{
        type: String
    }],
    notes: {
        type: String,
        trim: true
    },
    scheduledDate: {
        type: Date,
        required: true
    },
    completedDate: {
        type: Date
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Auto-recommend tests for abnormal results
followUpSchema.pre('save', function (next) {
    if (this.result === 'Abnormal' && this.recommendedTests.length === 0) {
        this.recommendedTests = [
            'Blood Test (CBC)',
            'HbA1c Test',
            'Fasting Blood Sugar',
            'Post-meal Sugar Test',
            'ECG',
            'Kidney Function Test'
        ];
    }
    next();
});

module.exports = mongoose.model('FollowUp', followUpSchema);
