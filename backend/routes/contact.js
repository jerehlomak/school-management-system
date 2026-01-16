const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// POST /api/contact - Submit a new message
router.post('/', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const newContact = new Contact({ name, email, message });
        await newContact.save();

        // Notify Admin
        const emailService = require('../services/emailService');
        try {
            const adminEmail = process.env.SCHOOL_EMAIL;
            if (adminEmail) {
                await emailService.sendAdminContactNotification(adminEmail, { name, email, message });
            }
        } catch (notifyErr) {
            console.error('Failed to send admin notification:', notifyErr);
        }

        res.status(201).json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error saving contact message:', error);
        res.status(500).json({ message: 'Failed to send message' });
    }
});

// GET /api/contact - Get all messages (Admin only - middleware can be added later)
// GET /api/contact - Get all messages with pagination
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await Contact.countDocuments();
        const messages = await Contact.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            data: messages,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error fetching contact messages:', error);
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
});

// DELETE /api/contact/:id - Delete a message
router.delete('/:id', async (req, res) => {
    try {
        const deletedMessage = await Contact.findByIdAndDelete(req.params.id);
        if (!deletedMessage) {
            return res.status(404).json({ message: 'Message not found' });
        }
        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ message: 'Failed to delete message' });
    }
});

module.exports = router;
