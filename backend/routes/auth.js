const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [
        { username: identifier },
        { id: identifier },
        { phoneNumber: identifier, role: { $ne: 'student' } } // Teachers/Parents can use phone number
      ]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (err) {
      // If it's not a valid bcrypt hash, bcrypt.compare might throw or return false
      isMatch = false;
    }

    // Fallback for plain-text comparison if it's a legacy user
    if (!isMatch && password === user.password) {
      isMatch = true;
      // Legacy user found with plain-text password, migrate to hashed password
      const SALT_ROUNDS = 10;
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      user.password = hashedPassword;
      await user.save();
      console.log(`User ${user.id} migrated to hashed password.`);
    }

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '24h' }, // Token valid for 24 hours
      (err, token) => {
        if (err) throw err;
        const userResponse = user.toObject();
        delete userResponse.password; // Remove password from response
        res.json({ token, user: userResponse });
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    // Generate token
    const token = crypto.randomBytes(20).toString('hex');

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send Email
    const emailService = require('../services/emailService');
    const resetLink = `http://localhost:3000/#/reset-password?token=${token}`;

    try {
      await emailService.sendPasswordResetEmail(user.email, resetLink, user.name);
      res.json({ message: 'Password reset link sent to your email.' });
    } catch (emailErr) {
      console.error('Failed to send reset email:', emailErr);
      res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
    }
  } catch (error) {
    console.error('Forgot Password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    const SALT_ROUNDS = 10;
    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Reset Password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
