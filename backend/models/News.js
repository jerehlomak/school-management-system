const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    summary: { type: String }, // Short description
    author: { type: String, default: 'Admin' },
    image: { type: String }, // Cloudinary URL
    category: { type: String, default: 'General' },
    date: { type: Date, default: Date.now },
    tags: [{ type: String }]
});

module.exports = mongoose.model('News', newsSchema);
