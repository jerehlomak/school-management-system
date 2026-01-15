const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Models
const News = require('../models/News');
const Event = require('../models/Event');
const Gallery = require('../models/Gallery');

// Cloudinary Config (Ensure .env is loaded in server.js)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'edves_content',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
});

const upload = multer({ storage: storage });

/* -------------------------------------------------------------------------- */
/*                                    NEWS                                    */
/* -------------------------------------------------------------------------- */
router.get('/news', async (req, res) => {
    try {
        const news = await News.find().sort({ date: -1 });
        res.json(news);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/news', upload.single('image'), async (req, res) => {
    try {
        const { title, content, author, category, date, summary, tags } = req.body;
        const image = req.file ? req.file.path : null;
        const newNews = new News({ title, content, author, category, date, summary, image, tags });
        await newNews.save();
        res.status(201).json(newNews);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/news/:id', async (req, res) => {
    try {
        await News.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted successfully' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/* -------------------------------------------------------------------------- */
/*                                   EVENTS                                   */
/* -------------------------------------------------------------------------- */
router.get('/events', async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 }); // Soonest first
        res.json(events);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/events', upload.single('image'), async (req, res) => {
    try {
        const { title, description, date, time, location } = req.body;
        const image = req.file ? req.file.path : null;
        const newEvent = new Event({ title, description, date, time, location, image });
        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/events/:id', async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted successfully' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/* -------------------------------------------------------------------------- */
/*                                   GALLERY                                  */
/* -------------------------------------------------------------------------- */
router.get('/gallery', async (req, res) => {
    try {
        const items = await Gallery.find().sort({ date: -1 });
        res.json(items);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/gallery', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Image is required' });
        const { title, category } = req.body;
        const imageUrl = req.file.path;
        const newItem = new Gallery({ title, category, imageUrl });
        await newItem.save();
        res.status(201).json(newItem);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/gallery/:id', async (req, res) => {
    try {
        await Gallery.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted successfully' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
