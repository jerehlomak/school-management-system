
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json()); // For parsing application/json
app.use('/uploads', express.static('uploads')); // Serve uploaded files statically

// Import models for initial data population
const User = require('./models/User.js');
const Course = require('./models/Course.js');
const StudentTermGrade = require('./models/StudentTermGrade.js');
const Payment = require('./models/Payment.js');
const SchoolClass = require('./models/SchoolClass.js');
const ClassLevel = require('./models/ClassLevel.js');

// --- Initial Data ---

// Function to populate initial data

// --- End Initial Data ---

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');

  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// API Routes
app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/users', require('./routes/users.js'));
app.use('/api/courses', require('./routes/courses.js'));
app.use('/api/grades', require('./routes/grades.js'));
app.use('/api/fees', require('./routes/fees.js'));
app.use('/api/payments', require('./routes/payments.js'));
app.use('/api/classes', require('./routes/classes.js'));
app.use('/api/class-levels', require('./routes/classLevels.js'));
app.use('/api/upload', require('./routes/upload.js'));

// Basic route for testing server
app.get('/', (req, res) => {
  res.send('Edves Portal Backend API is running!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
