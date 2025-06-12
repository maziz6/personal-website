const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');

// Fix: Correct method name
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// ✨ Modern validation middleware
const validateContactForm = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 chars')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('Only letters, spaces, hyphens, apostrophes'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
  body('subject').trim().isLength({ min: 5, max: 200 }).withMessage('Subject too short'),
  body('message').trim().isLength({ min: 10, max: 2000 }).withMessage('Message too short')
];

// 🔥 POST /api/contact
router.post('/', validateContactForm, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }

  const { name, email, subject, message } = req.body;
  const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] ?? req.socket?.remoteAddress ?? 'N/A';
  const userAgent = req.get('User-Agent') ?? 'Unknown';

  try {
    const { lastID } = await db.run(`
      INSERT INTO contacts (name, email, subject, message, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [name, email, subject, message, ipAddress, userAgent]);

    // Send emails (safe try/catch to not fail user experience)
    if (process.env.SMTP_USER && process.env.NOTIFICATION_EMAIL) {
      try {
        await sendEmailNotification({ name, email, subject, message, contactId: lastID });
      } catch (emailError) {
        console.warn('Email send failed:', emailError.message);
      }
    }

    await db.run(`
      UPDATE site_stats
      SET stat_value = stat_value + 1, updated_at = CURRENT_TIMESTAMP
      WHERE stat_name = 'contact_submissions'
    `);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully! I’ll get back to you soon.',
      data: { id: lastID, timestamp: new Date().toISOString() }
    });

  } catch (err) {
    console.error('Contact submission error:', err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
  }
});

