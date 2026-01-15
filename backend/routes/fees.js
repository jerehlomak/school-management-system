const express = require('express');
const router = express.Router();
const FeePayment = require('../models/FeePayment');
const User = require('../models/User');
const { generateUniqueAlphaNumericId } = require('../constants');

// GET /api/fees/status
// Check payment status for a specific student, term, and year
router.get('/status', async (req, res) => {
    const { studentId, term, year } = req.query;

    if (!studentId || !term || !year) {
        return res.status(400).json({ message: 'Missing required query parameters: studentId, term, year' });
    }

    try {
        const payment = await FeePayment.findOne({
            studentId,
            term: parseInt(term),
            year: parseInt(year),
            status: 'Completed'
        });

        if (payment) {
            return res.json({ paid: true, payment });
        } else {
            return res.json({ paid: false });
        }
    } catch (error) {
        console.error('Error checking fee status:', error);
        res.status(500).json({ message: 'Server error checking fee status' });
    }
});

// GET /api/fees/structure/:classId/:term
// Fetch fee structure for a specific class and term
router.get('/structure/:classId/:term', async (req, res) => {
    const { classId, term } = req.params;
    const year = new Date().getFullYear();

    try {
        // Find SchoolClass to get classLevelId
        const SchoolClass = require('../models/SchoolClass');
        const schoolClass = await SchoolClass.findOne({ id: classId });

        // Mock data if class not found or for initial testing
        if (!schoolClass) {
            // Return a default structure
            return res.json({
                items: [
                    { name: "Tuition", amount: 50000, isCompulsory: true, isTuition: true },
                    { name: "Development Levy", amount: 5000, isCompulsory: true, isTuition: false },
                    { name: "ICT Fee", amount: 2000, isCompulsory: true, isTuition: false },
                    { name: "Text Books", amount: 15000, isCompulsory: false, isTuition: false },
                    { name: "School Uniform", amount: 10000, isCompulsory: false, isTuition: false }
                ],
                totalCompulsory: 57000
            });
        }

        const FeeStructure = require('../models/FeeStructure');
        let structure = await FeeStructure.findOne({
            classLevelId: schoolClass.classLevelId,
            term: parseInt(term),
            year
        });

        // Use mock data if not in DB
        if (!structure) {
            structure = {
                items: [
                    { name: "Tuition", amount: 50000, isCompulsory: true, isTuition: true },
                    { name: "Development Levy", amount: 5000, isCompulsory: true, isTuition: false },
                    { name: "ICT Fee", amount: 2000, isCompulsory: true, isTuition: false },
                    { name: "Text Books", amount: 15000, isCompulsory: false, isTuition: false },
                    { name: "School Uniform", amount: 10000, isCompulsory: false, isTuition: false }
                ]
            };
        }

        res.json(structure);

    } catch (error) {
        console.error('Error fetching fee structure:', error);
        res.status(500).json({ message: 'Server error fetching fee structure' });
    }
});


// POST /api/fees/structure
// Save or update fee structure for a class level and term
router.post('/structure', async (req, res) => {
    const { classLevelId, term, itemGroups } = req.body;
    // itemGroups expected format: [{ name, amount, isCompulsory, isTuition }]

    if (!classLevelId || !term || !itemGroups) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const FeeStructure = require('../models/FeeStructure');
        const year = new Date().getFullYear(); // Current year for now, could be passed in

        let structure = await FeeStructure.findOne({
            classLevelId,
            term: parseInt(term),
            year
        });

        if (structure) {
            structure.items = itemGroups;
            structure.totalAmount = itemGroups.reduce((sum, item) => sum + (item.isCompulsory ? item.amount : 0), 0);
            await structure.save();
        } else {
            const { generateUniqueAlphaNumericId } = require('../constants');
            const totalAmount = itemGroups.reduce((sum, item) => sum + (item.isCompulsory ? item.amount : 0), 0);
            structure = new FeeStructure({
                id: generateUniqueAlphaNumericId('fs', []),
                classLevelId,
                term: parseInt(term),
                year,
                items: itemGroups,
                totalAmount
            });
            await structure.save();
        }

        res.json({ message: 'Fee structure saved successfully', structure });
    } catch (error) {
        console.error('Error saving fee structure:', error);
        res.status(500).json({ message: 'Server error saving fee structure' });
    }
});

// POST /api/fees/generate-rrr
// Create a Pending payment and generate an RRR
router.post('/generate-rrr', async (req, res) => {
    const { studentId, amount, description, term, year, items, isPartPayment } = req.body;

    if (!studentId || !amount || !description) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        // Validate Part Payment (Min 50% of Tuition) if applicable
        // Ideally we would fetch the tuition amount from FeeStructure here to verify
        // For now, we trust the frontend validation but backend check is better practice.
        /*
        if (isPartPayment) {
            // const structure = ... fetch structure ...
            // const tuition = structure.items.find(i => i.isTuition).amount;
            // if (amount < tuition * 0.5) return error;
        }
        */

        // Generate a mock RRR
        const rrr = Math.floor(100000000000 + Math.random() * 900000000000).toString();
        const paymentId = generateUniqueAlphaNumericId('pay', []);

        const newPayment = new FeePayment({
            id: paymentId,
            studentId,
            amount,
            description,
            term: term || 1,
            year: year || new Date().getFullYear(),
            status: 'Pending',
            rrr,
            paymentLink: `https://www.remita.net/pay/${rrr}`,
            itemsPaid: items || [],
            isPartPayment: !!isPartPayment,
            balanceRemaining: 0 // In a real app, calculate total - paid
        });

        await newPayment.save();

        res.status(201).json({
            rrr,
            paymentLink: newPayment.paymentLink,
            amount: newPayment.amount,
            paymentId: newPayment.id
        });

    } catch (error) {
        console.error('Error generating RRR:', error);
        res.status(500).json({ message: 'Server error generating RRR' });
    }
});

// POST /api/fees/pay
// Mock endpoint to initiate/record a payment (Keeping for backward compatibility or direct pay simulation)
router.post('/pay', async (req, res) => {
    const { studentId, amount, description, term, year } = req.body;

    try {
        const existingPayment = await FeePayment.findOne({
            studentId,
            term,
            year,
            status: 'Completed'
        });

        if (existingPayment) {
            return res.status(400).json({ message: 'Fees for this term and year have already been paid.' });
        }

        // Generate a mock RRR
        const rrr = Math.floor(100000000000 + Math.random() * 900000000000).toString();
        const paymentId = generateUniqueAlphaNumericId('pay', []); // Simplified ID generation for now

        const newPayment = new FeePayment({
            id: paymentId,
            studentId,
            amount,
            description,
            term,
            year,
            status: 'Completed', // Auto-complete for mock purposes
            rrr,
            paymentLink: `https://www.remita.net/pay/${rrr}` // Mock link
        });

        await newPayment.save();

        res.status(201).json({
            message: 'Payment successful',
            payment: newPayment
        });

    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ message: 'Server error processing payment' });
    }
});

// GET /api/fees/history/:studentId
router.get('/history/:studentId', async (req, res) => {
    try {
        const payments = await FeePayment.find({ studentId: req.params.studentId }).sort({ date: -1 });
        res.json(payments);
    } catch (error) {
        console.error('Error fetching payment history:', error);
        res.status(500).json({ message: 'Server error fetching history' });
    }
});
// GET /api/fees/status
// Check if a student has paid compulsory fees for a term
router.get('/status', async (req, res) => {
    const { studentId, term, year } = req.query;

    if (!studentId || !term || !year) {
        return res.status(400).json({ message: 'Missing required parameters' });
    }

    try {
        // 1. Fetch Fee Structure to see what is compulsory
        // Note: Logic here is simplified. In real app, we check specific items.
        // Here we just check if a "Completed" payment exists for this term/year
        // that matches (or exceeds) the total compulsory amount?
        // OR simpler: Just check if *any* "Completed" payment exists for this term/year.
        // Let's go with the simpler approach for this prototype:
        // If they have a completed payment record for this term/year, they have access.

        // Refinement: Check if full tuition is paid or if status is Completed.
        const payment = await FeePayment.findOne({
            studentId,
            term: parseInt(term),
            year: parseInt(year),
            status: 'Completed'
        });

        if (payment) {
            return res.json({ paid: true, message: 'Fees paid' });
        } else {
            return res.json({ paid: false, message: 'No completed payment found for this term' });
        }

    } catch (error) {
        console.error('Error checking fee status:', error);
        res.status(500).json({ message: 'Server error checking status' });
    }
});

// GET /api/fees/recent
// Fetch recent payments for admin dashboard
router.get('/recent', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        // Fetch payments without populate first
        let payments = await FeePayment.find({})
            .sort({ date: -1 })
            .limit(limit)
            .lean(); // Use lean() for better performance and easier modification

        // Extract student IDs
        const studentIds = payments.map(p => p.studentId);

        // Fetch user details for these IDs
        const users = await User.find({ id: { $in: studentIds } }).select('name id classId');

        // Map users to payments
        payments = payments.map(payment => {
            const user = users.find(u => u.id === payment.studentId);
            return {
                ...payment,
                studentName: user ? user.name : 'Unknown',
                classId: user ? user.classId : 'Unknown'
            };
        });

        res.json(payments);

    } catch (error) {
        console.error('Error fetching recent payments:', error);
        res.status(500).json({ message: 'Server error fetching recent payments' });
    }
});

// GET /api/fees/all
// Fetch all payments with filtering capabilities
router.get('/all', async (req, res) => {
    try {
        const { studentName, classId, startDate, endDate, status } = req.query;

        let query = {};

        // 1. Filter by Status
        if (status && status !== 'All') {
            query.status = status;
        }

        // 2. Filter by Date Range
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        // 3. Filter by Student Name or Class (Requires User Lookup first)
        if (studentName || classId) {
            const userQuery = { role: 'student' };
            if (studentName) {
                userQuery.name = { $regex: studentName, $options: 'i' };
            }
            if (classId) {
                userQuery.classId = classId;
            }

            const users = await User.find(userQuery).select('id');
            const studentIds = users.map(u => u.id);

            // If filtering and no students found, return empty early
            if (studentIds.length === 0) {
                return res.json([]);
            }

            query.studentId = { $in: studentIds };
        }

        // Execute Payment Query
        let payments = await FeePayment.find(query).sort({ date: -1 }).lean();

        // Populate details manually
        const allStudentIds = [...new Set(payments.map(p => p.studentId))];
        const allUsers = await User.find({ id: { $in: allStudentIds } }).select('name id classId');

        // Attach details
        payments = payments.map(p => {
            const user = allUsers.find(u => u.id === p.studentId);
            return {
                ...p,
                studentName: user ? user.name : 'Unknown',
                classId: user ? user.classId : 'Unknown'
            };
        });

        res.json(payments);

    } catch (error) {
        console.error('Error fetching all payments:', error);
        res.status(500).json({ message: 'Server error fetching payments' });
    }
});

// PUT /api/fees/:id/status
// Update payment status (e.g. Confirm a Pending payment)
router.put('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Completed', 'Failed'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        const payment = await FeePayment.findOne({ id });
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        payment.status = status;
        await payment.save();

        res.json({ message: 'Payment status updated', payment });
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({ message: 'Server error updating payment status' });
    }
});

module.exports = router;
