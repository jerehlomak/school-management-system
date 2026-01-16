const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Application = require('../models/Application');

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'edves_applications', // Folder name in Cloudinary
        allowed_formats: ['jpg', 'png', 'pdf', 'jpeg'],
        resource_type: 'auto', // Auto-detect image or raw (pdf)
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// POST /api/applications - Submit a new application
router.post('/',
    upload.fields([
        { name: 'passport', maxCount: 1 },
        { name: 'documents', maxCount: 5 } // Allow up to 5 supporting docs
    ]),
    async (req, res) => {
        try {
            console.log('Received application submission');
            console.log('Body:', req.body);
            console.log('Files:', req.files);

            const {
                firstName, lastName, middleName, dob, gender, grade,
                parentName, parentEmail, parentPhone, address,
                prevSchool, medicalInfo
            } = req.body;

            // Validate required fields (basic check)
            if (!firstName || !lastName || !parentEmail) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            // Process Files
            let passportUrl = '';
            let documentUrls = [];

            if (req.files) {
                if (req.files['passport'] && req.files['passport'][0]) {
                    passportUrl = req.files['passport'][0].path; // Cloudinary returns 'path' as the secure URL
                }

                if (req.files['documents']) {
                    documentUrls = req.files['documents'].map(file => file.path);
                }
            }

            const newApplication = new Application({
                firstName,
                lastName,
                middleName,
                dateOfBirth: new Date(dob),
                gender,
                grade,
                parentName,
                parentEmail,
                parentPhone,
                address,
                prevSchool,
                medicalInfo,
                passportUrl,
                documentUrls
            });

            const savedApp = await newApplication.save();

            // Notify Admin
            const emailService = require('../services/emailService');
            try {
                const adminEmail = process.env.SCHOOL_EMAIL;
                if (adminEmail) {
                    await emailService.sendAdminApplicationNotification(adminEmail, savedApp);
                }
            } catch (notifyErr) {
                console.error('Failed to send admin notification:', notifyErr);
                // Don't fail the response
            }

            res.status(201).json(savedApp);

        } catch (err) {
            console.error('Error submitting application:', err);
            res.status(500).json({ message: 'Failed to submit application', error: err.message });
        }
    });

// GET /api/applications - Get all applications (Admin only)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit) || 10;

        if (page) {
            const skip = (page - 1) * limit;
            const total = await Application.countDocuments();
            const applications = await Application.find().sort({ submissionDate: -1 }).skip(skip).limit(limit);
            res.json({
                data: applications,
                total,
                page,
                totalPages: Math.ceil(total / limit)
            });
        } else {
            const applications = await Application.find().sort({ submissionDate: -1 });
            res.json(applications);
        }
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch applications' });
    }
});

// PATCH /api/applications/:id/status - Update status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status, interviewDate } = req.body;

        if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Validate Interview Date if Approving
        if (status === 'Approved' && !interviewDate) {
            return res.status(400).json({ message: 'Interview date is required for approval.' });
        }

        const updateData = { status };
        if (status === 'Approved') {
            updateData.interviewDate = interviewDate;
        }

        const updatedApp = await Application.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!updatedApp) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Send Email Notification
        if (status === 'Approved') {
            const emailService = require('../services/emailService');
            // We use 'await' here to ensure email is sent? Or fire and forget?
            // Safer to await to catch errors, but might slow response.
            // Let's await but wrap in try/catch specifically for email so it doesn't fail the request if email fails (or maybe it should?).
            // For now, let's log error but not fail request, as status is already updated.
            try {
                await emailService.sendApplicationApprovalEmail(
                    updatedApp.parentEmail,
                    `${updatedApp.firstName} ${updatedApp.lastName}`,
                    updatedApp.interviewDate,
                    updatedApp.parentName
                );
            } catch (emailErr) {
                console.error('Failed to send approval email:', emailErr);
                // Can return a warning in response?
            }
        }

        res.json(updatedApp);
    } catch (err) {
        console.error('Update status error:', err);
        res.status(500).json({ message: 'Failed to update status' });
    }
});

module.exports = router;
