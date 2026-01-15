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
            res.status(201).json(savedApp);

        } catch (err) {
            console.error('Error submitting application:', err);
            res.status(500).json({ message: 'Failed to submit application', error: err.message });
        }
    });

// GET /api/applications - Get all applications (Admin only)
router.get('/', async (req, res) => {
    try {
        const applications = await Application.find().sort({ submissionDate: -1 });
        res.json(applications);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch applications' });
    }
});

// PATCH /api/applications/:id/status - Update status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const updatedApp = await Application.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!updatedApp) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.json(updatedApp);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update status' });
    }
});

module.exports = router;
