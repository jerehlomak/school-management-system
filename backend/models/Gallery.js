const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    title: { type: String },
    category: { type: String, default: 'General' },
    imageUrl: { type: String, required: true }, // Cloudinary URL
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Gallery', gallerySchema);
