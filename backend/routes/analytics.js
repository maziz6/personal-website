// server/routes/analytics.js - Modernized Analytics and Tracking Routes for 2025

const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');
const db = require('../config/database');
const { body, query, validationResult } = require('express-validator');

// Utility: Return formatted client IP
const getClientIP = (req) => req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || '127.0.0.1';

// Middleware: Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  next();
};

// POST /api/analytics/pageview
router.post('/pageview', [
  body('pageUrl').isURL({ require_protocol: false }).withMessage('Valid page URL is required'),
  body('sessionId').isLength({ min: 10, max: 100 }).withMessage('Valid session ID is required'),
  body('referrer').optional().isString(),
  handleValidationErrors
], async (req, res) => {
  try {
    const { pageUrl, sessionId, referrer } = req.body;
    const ipAddress = getClientIP(req);
    const userAgent = req.get('User-Agent');

    const result = await analyticsService.trackPageView({ pageUrl, sessionId, referrer, ipAddress, userAgent });
    return res.status(result.success ? 200 : 500).json({ success: result.success, message: result.success ? 'Page view tracked successfully' : 'Failed to track page view' });
  } catch (err) {
    console.error('Page view error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/analytics/summary
router.get('/summary', [
  query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365'),
  handleValidationErrors
], async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const summary = await analyticsService.getAnalyticsSummary(days);
    res.status(summary ? 200 : 500).json({ success: !!summary, data: summary || null, message: summary ? undefined : 'Failed to fetch summary' });
  } catch (err) {
    console.error('Summary error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/analytics/realtime
router.get('/realtime', async (_req, res) => {
  try {
    const stats = await analyticsService.getRealtimeStats();
    res.status(stats ? 200 : 500).json({ success: !!stats, data: stats || null, message: stats ? undefined : 'Failed to fetch real-time stats' });
  } catch (err) {
    console.error('Realtime error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/analytics/popular-pages
router.get('/popular-pages', [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  handleValidationErrors
], async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const pages = await db.all(`
      SELECT page_url, view_count, unique_visitors, last_updated
      FROM popular_pages
      ORDER BY view_count DESC
      LIMIT ?
    `, [limit]);
    res.json({ success: true, data: pages });
  } catch (err) {
    console.error('Popular pages error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/analytics/visitor-stats
router.get('/visitor-stats', [
  query('period').optional().isIn(['today', 'week', 'month', 'year']).withMessage('Invalid period'),
  handleValidationErrors
], async (req, res) => {
  try {
    const period = req.query.period || 'month';
    const map = {
      today: ["DATE(created_at) = DATE('now')", "strftime('%H', created_at)"],
      week: ["created_at >= datetime('now', '-7 days')", "DATE(created_at)"],
      month: ["created_at >= datetime('now', '-30 days')", "DATE(created_at)"],
      year: ["created_at >= datetime('now', '-365 days')", "strftime('%Y-%m', created_at)"]
    };
    const [where, groupBy] = map[period];
    const stats = await db.all(`
      SELECT ${groupBy} as period, COUNT(*) as page_views, COUNT(DISTINCT ip_address) as unique_visitors
      FROM page_views
      WHERE ${where}
      GROUP BY ${groupBy}
      ORDER BY period
    `);
    res.json({ success: true, data: { period, stats } });
  } catch (err) {
    console.error('Visitor stats error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/analytics/device-stats
router.get('/device-stats', async (_req, res) => {
  try {
    const devices = await db.all(`
      SELECT device_type, COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM page_views WHERE device_type IS NOT NULL), 2) as percentage
      FROM page_views WHERE device_type IS NOT NULL
        AND created_at >= datetime('now', '-30 days')
      GROUP BY device_type ORDER BY count DESC
    `);
    const browsers = await db.all(`
      SELECT browser, COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM page_views WHERE browser IS NOT NULL), 2) as percentage
      FROM page_views WHERE browser IS NOT NULL
        AND created_at >= datetime('now', '-30 days')
      GROUP BY browser ORDER BY count DESC LIMIT 10
    `);
    const os = await db.all(`
      SELECT os, COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM page_views WHERE os IS NOT NULL), 2) as percentage
      FROM page_views WHERE os IS NOT NULL
        AND created_at >= datetime('now', '-30 days')
      GROUP BY os ORDER BY count DESC LIMIT 10
    `);
    res.json({ success: true, data: { devices, browsers, operatingSystems: os } });
  } catch (err) {
    console.error('Device stats error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// DELETE /api/analytics/cleanup
router.delete('/cleanup', [
  query('days').optional().isInt({ min: 30, max: 365 }).withMessage('Days must be between 30 and 365'),
  handleValidationErrors
], async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 90;
    const deletedCount = await analyticsService.cleanupOldData(days);
    res.json({ success: true, message: `Cleaned up ${deletedCount} old records`, deletedCount });
  } catch (err) {
    console.error('Cleanup error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/analytics/export
router.get('/export', [
  query('format').optional().isIn(['json', 'csv']).withMessage('Format must be json or csv'),
  query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365'),
  handleValidationErrors
], async (req, res) => {
  try {
    const format = req.query.format || 'json';
    const days = parseInt(req.query.days) || 30;
    const dateFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const analyticsData = await db.all(`
      SELECT page_url, ip_address, device_type, browser, os, referrer, country, city, created_at
      FROM page_views
      WHERE created_at >= ?
      ORDER BY created_at DESC
    `, [dateFrom]);

    if (format === 'csv') {
      const csvHeader = 'Page URL,IP Address,Device,Browser,OS,Referrer,Country,City,Date';
      const csvBody = analyticsData.map(row => `"${row.page_url}","${row.ip_address}","${row.device_type}","${row.browser}","${row.os}","${row.referrer || ''}","${row.country || ''}","${row.city || ''}","${row.created_at}"`).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="analytics-${days}days.csv"`);
      return res.send(`${csvHeader}\n${csvBody}`);
    }

    res.json({ success: true, data: analyticsData, period: `${days} days`, totalRecords: analyticsData.length });
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;