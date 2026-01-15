const mongoose = require('mongoose');

const FeeStructureSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    classLevelId: { type: String, ref: 'ClassLevel', required: true }, // e.g., 'JSS1' (fees are usually per level, not specific class arm like JSS1A)
    term: { type: Number, required: true, enum: [1, 2, 3] },
    year: { type: Number, required: true },
    items: [{
        name: { type: String, required: true }, // e.g., "Tuition", "Books", "Uniform"
        amount: { type: Number, required: true },
        isCompulsory: { type: Boolean, default: true },
        isTuition: { type: Boolean, default: false } // To identify the tuition component for 50% rule
    }],
    totalAmount: { type: Number } // Helper to store total of compulsory items
});

module.exports = mongoose.model('FeeStructure', FeeStructureSchema);
