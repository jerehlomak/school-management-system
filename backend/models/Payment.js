
const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  studentId: { type: String, ref: 'User', required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  date: { type: String, required: true }, // Storing as 'YYYY-MM-DD' string for simplicity
  status: { type: String, enum: ['Pending', 'Completed', 'Failed'], required: true },
  rrr: { type: String },
  paymentLink: { type: String },
});

module.exports = mongoose.model('Payment', PaymentSchema);
