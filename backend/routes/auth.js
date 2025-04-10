const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Register user
router.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });
    const newUser = new User({ name, email, phone, password });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    console.log("User found:", user); // Debugging line
    console.log("Stored Password Hash:", user.password); // Debugging line

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // Use Gmail, or replace with your SMTP provider
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your app password (not your real password)
  },
});

// Forgot Password Route
router.post('/forgot-password', async (req, res) => {
  console.log("Forgot Password Route Hit");

  const { email } = req.body;

  try {
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    console.log("User found:", user); // Debugging line

    // Generate reset token (6-digit code)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = verificationCode;
    user.resetPasswordExpires = Date.now() + 600000; // 10 minutes expiry
    await user.save();

    console.log("Verification Code:", verificationCode); // Debugging line
    console.log("User after saving token:", user); // Debugging line

    // Send Email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Code",
      text: `Your password reset code is: ${verificationCode}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ message: "Error sending email", error: error.message });
      }
      console.log("Email sent:", info.response);
      res.json({ message: "Verification code sent to your email" });
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//verify code
router.post('/verify-code', async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Check if the code matches and is not expired
    if (user.resetPasswordToken !== code || user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    res.json({ message: "Code verified. Proceed to reset password" });

  } catch (error) {
    console.error("Verify Code Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Reset Password
// auth.js - Reset Password Route (corrected)
router.post('/reset-password', async (req, res) => {
  const { email, code, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Verify code (existing logic)
    if (user.resetPasswordToken !== code || user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    // Set plaintext password - pre-save hook will hash it
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save(); // Triggers the pre('save') hook

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
