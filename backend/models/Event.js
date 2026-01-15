const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true }, // Event date
    time: { type: String }, // e.g. "10:00 AM"
    location: { type: String },
    image: { type: String }, // Cloudinary URL
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);
