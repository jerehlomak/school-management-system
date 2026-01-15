const mongoose = require('mongoose');

const FeePaymentSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    studentId: { type: String, ref: 'User', required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true }, // e.g., "JSS1 First Term School Fees"
    term: { type: Number, required: true, enum: [1, 2, 3] },
    year: { type: Number, required: true }, // Academic Year, e.g., 2025
    date: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending'
    },
    rrr: { type: String }, // Remita Retrieval Reference
    paymentLink: { type: String },
    itemsPaid: [{
        name: { type: String },
        amount: { type: Number }
    }],
    isPartPayment: { type: Boolean, default: false },
    balanceRemaining: { type: Number, default: 0 }
});

module.exports = mongoose.model('FeePayment', FeePaymentSchema);
