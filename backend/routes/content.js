const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Models
const News = require('../models/News');
const Event = require('../models/Event');
const Gallery = require('../models/Gallery');
const Testimonial = require('../models/Testimonial');

// Cloudinary Config (Ensure .env is loaded in server.js)
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
        let image = req.file ? req.file.path : null;

        // If using local storage, construct full URL
        if (image && !image.startsWith('http')) {
            const protocol = req.protocol;
            const host = req.get('host');
            const normalizedPath = image.replace(/\\/g, '/');
            image = `${protocol}://${host}/${normalizedPath}`;
        }

        const newNews = new News({ title, content, author, category, date, summary, image, tags });
        await newNews.save();
        res.status(201).json(newNews);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ... (delete route)
router.delete('/news/:id', async (req, res) => {
    try {
        await News.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted successfully' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/news/:id', upload.single('image'), async (req, res) => {
    try {
        const { title, content, author, category, date, summary, tags } = req.body;
        const updateData = { title, content, author, category, date, summary, tags };

        if (req.file) {
            updateData.image = req.file.path;
        }

        const updatedNews = await News.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updatedNews);
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
        let image = req.file ? req.file.path : null;

        // If using local storage, construct full URL
        if (image && !image.startsWith('http')) {
            const protocol = req.protocol;
            const host = req.get('host');
            const normalizedPath = image.replace(/\\/g, '/');
            image = `${protocol}://${host}/${normalizedPath}`;
        }

        const newEvent = new Event({ title, description, date, time, location, image });
        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ... (delete route)
router.delete('/events/:id', async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted successfully' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/events/:id', upload.single('image'), async (req, res) => {
    try {
        const { title, description, date, time, location } = req.body;
        const updateData = { title, description, date, time, location };

        if (req.file) {
            updateData.image = req.file.path;
        }

        const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updatedEvent);
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

// ... (delete route)
router.delete('/gallery/:id', async (req, res) => {
    try {
        await Gallery.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted successfully' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/gallery/:id', upload.single('image'), async (req, res) => {
    try {
        const { title, category } = req.body;
        const updateData = { title, category };

        if (req.file) {
            updateData.imageUrl = req.file.path;
        }

        const updatedItem = await Gallery.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updatedItem);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/* -------------------------------------------------------------------------- */
/*                                TESTIMONIALS                                */
/* -------------------------------------------------------------------------- */
router.get('/testimonials', async (req, res) => {
    try {
        const items = await Testimonial.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/testimonials', upload.single('image'), async (req, res) => {
    try {
        const { name, role, text } = req.body;
        let image = req.file ? req.file.path : null;

        const newItem = new Testimonial({ name, role, text, image });
        await newItem.save();
        res.status(201).json(newItem);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/testimonials/:id', async (req, res) => {
    try {
        await Testimonial.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted successfully' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/testimonials/:id', upload.single('image'), async (req, res) => {
    try {
        const { name, role, text } = req.body;
        const updateData = { name, role, text };

        if (req.file) {
            updateData.image = req.file.path;
        }

        const updatedItem = await Testimonial.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updatedItem);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
