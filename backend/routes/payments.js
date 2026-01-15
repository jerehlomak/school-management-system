
const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const { generateUniqueAlphaNumericId } = require('../constants'); // For RRR generation

// Helper to simulate Remita RRR generation
const generateRemitaRRRMock = (studentId, amount, description) => {
  const rrr = `R${Math.floor(10000000000000000000 + Math.random() * 90000000000000000000)}`;
  const paymentLink = `https://remita.net/pay/${rrr}`; // Mock Remita payment link
  return { rrr, paymentLink, amount };
};

// GET /api/payments/student/:studentId - Fetch payments for a specific student
router.get('/student/:studentId', async (req, res) => {
  const { studentId } = req.params;
  try {
    const payments = await Payment.find({ studentId }).sort({ date: -1 });
    res.json(payments);
  } catch (error) {
    console.error('Error fetching student payments:', error);
    res.status(500).json({ message: 'Server error fetching payments' });
  }
});

// POST /api/payments/add - Add a new payment record
router.post('/add', async (req, res) => {
  const paymentData = req.body;
  try {
    // Generate a unique ID for the new payment
    const existingPaymentIds = await Payment.find({}).select('id');
    const newPaymentId = generateUniqueAlphaNumericId('pay', existingPaymentIds.map(p => p.id));
    
    const newPayment = new Payment({ ...paymentData, id: newPaymentId, date: new Date().toISOString().split('T')[0] });
    await newPayment.save();
    res.status(201).json(newPayment);
  } catch (error) {
    console.error('Error adding payment:', error);
    res.status(500).json({ message: 'Server error adding payment', error: error.message });
  }
});

// POST /api/payments/generate-rrr
router.post('/generate-rrr', async (req, res) => {
  const { studentId, amount, description } = req.body;
  try {
    const rrrInfo = generateRemitaRRRMock(studentId, amount, description);
    res.json(rrrInfo);
  } catch (error) {
    console.error('Error generating RRR:', error);
    res.status(500).json({ message: 'Server error generating RRR' });
  }
});

// PUT /api/payments/:id/status - Update payment status
router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, rrr } = req.body; // status and optional rrr

  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { id },
      { $set: { status, rrr, date: new Date().toISOString().split('T')[0] } },
      { new: true }
    );

    if (!updatedPayment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(updatedPayment);
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: 'Server error updating payment status' });
  }
});

module.exports = router;
