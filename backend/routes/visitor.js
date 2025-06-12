// server/routes/visitor.js - Modernized Visitor Tracking Routes (2025)
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { body, validationResult } = require('express-validator');

// Smart User-Agent Parser
const parseUserAgent = (ua = '') => {
  const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua);

  const deviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

  const browser =
    ua.includes('Chrome') ? 'Chrome' :
    ua.includes('Firefox') ? 'Firefox' :
    ua.includes('Safari') && !ua.includes('Chrome') ? 'Safari' :
    ua.includes('Edge') ? 'Edge' :
    ua.includes('Opera') ? 'Opera' : 'Unknown';

  const os =
    ua.includes('Windows') ? 'Windows' :
    ua.includes('Mac OS') ? 'macOS' :
    ua.includes('Linux') ? 'Linux' :
    ua.includes('Android') ? 'Android' :
    ua.includes('iOS') ? 'iOS' : 'Unknown';

  return { deviceType, browser, os };
};

// Validation Rules
const visitorValidation = [
  body('sessionId').trim().isLength({ min: 1, max: 100 }).withMessage('Session ID is required'),
  body('page').trim().isLength({ min: 1, max: 500 }).withMessage('Page path is required'),
  body('referrer').optional().trim().isLength({ max: 500 }).withMessage('Referrer URL too long')
];

// POST /api/visitor/track
router.post('/track', visitorValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { sessionId, page, referrer = '' } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || '';
  const visitDate = new Date().toISOString().split('T')[0];
  const { deviceType, browser, os } = parseUserAgent(userAgent);

  try {
    const existingVisitor = await db.get('SELECT id FROM visitors WHERE session_id = ?', [sessionId]);
    const isNewSession = !(await db.get('SELECT id FROM visitors WHERE session_id = ? AND visit_date = ?', [sessionId, visitDate]));

    const result = await db.run(`INSERT INTO visitors (session_id, ip_address, user_agent, page, referrer, device_type, browser, os, visit_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [sessionId, ipAddress, userAgent, page, referrer, deviceType, browser, os, visitDate]);

    const updates = [
      db.run(`UPDATE site_stats SET stat_value = stat_value + 1, updated_at = CURRENT_TIMESTAMP WHERE stat_name = 'page_views'`),
      db.run(`UPDATE site_stats SET stat_value = stat_value + 1, updated_at = CURRENT_TIMESTAMP WHERE stat_name = 'total_visitors'`)
    ];

    if (isNewSession) {
      updates.push(
        db.run(`UPDATE site_stats SET stat_value = stat_value + 1, updated_at = CURRENT_TIMESTAMP WHERE stat_name = 'unique_visitors'`)
      );
    }

    await Promise.all(updates);
    const stats = await getVisitorStats();

    res.status(201).json({
      success: true,
      message: 'Visitor tracked',
      data: {
        visitorId: result.id,
        isNewVisitor: !existingVisitor,
        isNewSession,
        deviceInfo: { deviceType, browser, os },
        ...stats
      }
    });
  } catch (error) {
    console.error('Track Error:', error);
    res.status(500).json({ success: false, message: 'Visitor tracking failed' });
  }
});

// GET /api/visitor/stats
router.get('/stats', async (_, res) => {
  try {
    const stats = await getVisitorStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error('Stats Error:', err);
    res.status(500).json({ success: false, message: 'Stats fetch failed' });
  }
});

// GET /api/visitor/analytics
router.get('/analytics', async (req, res) => {
  const days = parseInt(req.query.timeframe || '30');
  const dateCutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  try {
    const [dailyStats, topPages, deviceStats, browserStats, referrerStats] = await Promise.all([
      db.all(`SELECT visit_date, COUNT(*) as page_views, COUNT(DISTINCT session_id) as unique_visitors FROM visitors WHERE visit_date >= date(?) GROUP BY visit_date ORDER BY visit_date ASC`, [dateCutoff]),
      db.all(`SELECT page, COUNT(*) as views, COUNT(DISTINCT session_id) as unique_views FROM visitors WHERE visit_date >= date(?) GROUP BY page ORDER BY views DESC LIMIT 10`, [dateCutoff]),
      db.all(`SELECT device_type, COUNT(*) as count, ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM visitors WHERE visit_date >= date(?)), 1) as percentage FROM visitors WHERE visit_date >= date(?) GROUP BY device_type`, [dateCutoff, dateCutoff]),
      db.all(`SELECT browser, COUNT(*) as count, ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM visitors WHERE visit_date >= date(?)), 1) as percentage FROM visitors WHERE visit_date >= date(?) GROUP BY browser`, [dateCutoff, dateCutoff]),
      db.all(`SELECT CASE WHEN referrer = '' OR referrer IS NULL THEN 'Direct' WHEN referrer LIKE '%google%' THEN 'Google' WHEN referrer LIKE '%github%' THEN 'GitHub' WHEN referrer LIKE '%linkedin%' THEN 'LinkedIn' WHEN referrer LIKE '%twitter%' THEN 'Twitter' ELSE 'Other' END as source, COUNT(*) as count FROM visitors WHERE visit_date >= date(?) GROUP BY source ORDER BY count DESC`, [dateCutoff])
    ]);

    res.json({
      success: true,
      data: { timeframe: days, dailyStats, topPages, deviceStats, browserStats, referrerStats }
    });
  } catch (err) {
    console.error('Analytics Error:', err);
    res.status(500).json({ success: false, message: 'Analytics fetch failed' });
  }
});

// Helper - Fetch Basic Visitor Stats
async function getVisitorStats() {
  const stats = await db.all(`SELECT stat_name, stat_value FROM site_stats WHERE stat_name IN ('total_visitors', 'unique_visitors', 'page_views')`);
  const result = Object.fromEntries(stats.map(s => [s.stat_name, parseInt(s.stat_value)]));

  const today = await db.get(`SELECT COUNT(*) as today_views, COUNT(DISTINCT session_id) as today_unique FROM visitors WHERE visit_date = date('now')`);
  return {
    totalVisitors: result.total_visitors || 0,
    uniqueVisitors: result.unique_visitors || 0,
    pageViews: result.page_views || 0,
    todayViews: today.today_views || 0,
    todayUnique: today.today_unique || 0
  };
}

module.exports = router;
