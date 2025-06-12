// server/routes/feedback.js - Modernized Feedback Routes (2025)
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { body, validationResult } = require('express-validator');

// Validation rules
const validateFeedback = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  body('category').isIn(['design', 'functionality', 'content', 'overall']).withMessage('Invalid category'),
  body('feedback').trim().isLength({ min: 10, max: 1000 }).withMessage('Feedback must be 10-1000 characters'),
  body('isPublic').optional().isBoolean()
];

// POST /api/feedback
router.post('/', validateFeedback, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { name, email, rating, category, feedback, isPublic = false } = req.body;
  const ipAddress = req.ip;
  const userAgent = req.get('User-Agent');

  try {
    const result = await db.run(`
      INSERT INTO feedback (name, email, rating, category, feedback, is_public, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, email, rating, category, feedback, isPublic ? 1 : 0, ipAddress, userAgent]);

    await db.run(`
      UPDATE site_stats SET stat_value = stat_value + 1, updated_at = CURRENT_TIMESTAMP
      WHERE stat_name = 'feedback_submissions'
    `);

    res.status(201).json({
      success: true,
      message: 'Thanks for your feedback!',
      data: { id: result.lastID, timestamp: new Date().toISOString() }
    });
  } catch (err) {
    console.error('Feedback error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit feedback' });
  }
});

// GET /api/feedback/public
router.get('/public', async (req, res) => {
  const { page = 1, limit = 10, category } = req.query;
  const offset = (page - 1) * limit;
  let where = 'WHERE is_public = 1 AND is_approved = 1';
  const params = [];

  if (category && ['design', 'functionality', 'content', 'overall'].includes(category)) {
    where += ' AND category = ?';
    params.push(category);
  }

  try {
    const count = await db.get(`SELECT COUNT(*) as total FROM feedback ${where}`, params);
    const feedback = await db.all(`
      SELECT id, name, rating, category, feedback, created_at
      FROM feedback ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const stats = await db.all(`
      SELECT category, COUNT(*) as count, AVG(rating) as avg_rating FROM feedback
      WHERE is_public = 1 AND is_approved = 1 GROUP BY category
    `);

    res.json({
      success: true,
      data: {
        feedback,
        pagination: {
          current_page: +page,
          total_pages: Math.ceil(count.total / limit),
          total_items: count.total
        },
        stats
      }
    });
  } catch (err) {
    console.error('Public feedback error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch feedback' });
  }
});

// PATCH /api/feedback/:id/approve
router.patch('/:id/approve', async (req, res) => {
  const { id } = req.params;
  const { is_approved } = req.body;
  try {
    const result = await db.run('UPDATE feedback SET is_approved = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [is_approved ? 1 : 0, id]);
    if (!result.changes) return res.status(404).json({ success: false, message: 'Feedback not found' });
    res.json({ success: true, message: `Feedback ${is_approved ? 'approved' : 'unapproved'}` });
  } catch (err) {
    console.error('Approve feedback error:', err);
    res.status(500).json({ success: false, message: 'Approval update failed' });
  }
});

// DELETE /api/feedback/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.run('DELETE FROM feedback WHERE id = ?', [req.params.id]);
    if (!result.changes) return res.status(404).json({ success: false, message: 'Feedback not found' });
    res.json({ success: true, message: 'Feedback deleted' });
  } catch (err) {
    console.error('Delete feedback error:', err);
    res.status(500).json({ success: false, message: 'Deletion failed' });
  }
});

module.exports = router;