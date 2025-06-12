// controllers/contactController.js - 2025-Ready Contact Controller
const Contact = require('../models/Contact');
const { sendEmail } = require('../utils/email');
const { validationResult } = require('express-validator');
const chalk = require('chalk');

exports.submitContact = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, subject, message } = req.body;

    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    const adminEmail = process.env.ADMIN_EMAIL || 'your-email@gmail.com';
    const timestamp = new Date().toLocaleString();
    const formattedMessage = message.replace(/\n/g, '<br>');

    try {
      // Admin Notification
      await sendEmail({
        to: adminEmail,
        subject: `New Contact Form Submission: ${subject}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${formattedMessage}</p>
          <hr>
          <p><small>Submitted at: ${timestamp}</small></p>
        `
      });

      // Auto-reply to user
      await sendEmail({
        to: email,
        subject: 'Thanks for contacting me! 🌟',
        html: `
          <h2>Thanks for reaching out!</h2>
          <p>Hi ${name},</p>
          <p>Got your message and I’ll be in touch soon. In the meantime, feel free to explore more on my portfolio.</p>
          <p><strong>Your message:</strong></p>
          <p>${formattedMessage}</p>
          <p>Warm regards,<br>Your Name</p>
        `
      });
    } catch (emailErr) {
      console.warn(chalk.yellow('⚠️ Email sending failed:'), emailErr);
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully! I’ll get back to you soon.',
      data: {
        id: contact._id,
        timestamp: contact.createdAt
      }
    });
  } catch (err) {
    console.error(chalk.red('❌ Contact submission error:'), err);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    });
  }
};

exports.getContacts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = status ? { status } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [contacts, total] = await Promise.all([
      Contact.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-ipAddress -userAgent'),
      Contact.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: contacts,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (err) {
    console.error(chalk.red('❌ Failed to fetch contacts:'), err);
    res.status(500).json({
      success: false,
      message: 'Unable to retrieve contact submissions.'
    });
  }
};
