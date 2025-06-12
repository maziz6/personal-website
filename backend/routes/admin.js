// server/routes/admin.js - Modernized Admin Dashboard Routes (2025)
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

// Rate limiter for login endpoint
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many login attempts. Try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Admin auth middleware
const authenticateAdmin = (req, res, next) => {
  const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

// POST: Admin Login
router.post('/login', [
  loginRateLimit,
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { username, password } = req.body;
    const admin = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM admins WHERE username = ?', [username], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    db.run('UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [admin.id]);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET: Dashboard Stats
router.get('/dashboard', authenticateAdmin, async (req, res) => {
  try {
    const [totalVisitors, totalMessages, totalFeedback, averageRating, recentMessages] = await Promise.all([
      new Promise((resolve, reject) => db.get('SELECT COUNT(*) AS count FROM visitors', (e, r) => e ? reject(e) : resolve(r.count))),
      new Promise((resolve, reject) => db.get('SELECT COUNT(*) AS count FROM contact_messages', (e, r) => e ? reject(e) : resolve(r.count))),
      new Promise((resolve, reject) => db.get('SELECT COUNT(*) AS count FROM feedback', (e, r) => e ? reject(e) : resolve(r.count))),
      new Promise((resolve, reject) => db.get('SELECT AVG(rating) AS avg_rating FROM feedback WHERE rating > 0', (e, r) => e ? reject(e) : resolve(r.avg_rating || 0))),
      new Promise((resolve, reject) => db.get('SELECT COUNT(*) AS count FROM contact_messages WHERE created_at >= date("now", "-7 days")', (e, r) => e ? reject(e) : resolve(r.count)))
    ]);

    res.json({
      success: true,
      data: {
        totalVisitors,
        totalMessages,
        totalFeedback,
        averageRating: Math.round(averageRating * 10) / 10,
        recentMessages
      }
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ success: false, message: 'Failed to load dashboard stats' });
  }
});

// Remaining routes: /messages & /feedback (GET, PUT, DELETE)
// Modularize if routes grow (e.g. messages.js, feedback.js)

module.exports = router;
