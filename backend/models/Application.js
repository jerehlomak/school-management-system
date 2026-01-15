const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    // Student Info
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    middleName: { type: String },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['Male', 'Female'], required: true },
    grade: { type: String, required: true }, // e.g. "JSS 1", "7"

    // Parent/Guardian Info
    parentName: { type: String, required: true },
    parentEmail: { type: String, required: true },
    parentPhone: { type: String, required: true },
    address: { type: String, required: true },

    // History & Medical
    prevSchool: { type: String },
    medicalInfo: { type: String },

    // Documents (URLs to stored files)
    passportUrl: { type: String }, // Single file
    documentUrls: [{ type: String }], // Array of file URLs

    // System
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    submissionDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', applicationSchema);
