// server/services/analyticsService.js - Analytics and tracking service
const db = require('../config/database');

class AnalyticsService {
  constructor() {
    this.initializeTables();
  }

  async initializeTables() {
    try {
      // Page views table
      await db.run(`
        CREATE TABLE IF NOT EXISTS page_views (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          page_url VARCHAR(255) NOT NULL,
          user_agent TEXT,
          ip_address VARCHAR(45),
          referrer TEXT,
          country VARCHAR(100),
          city VARCHAR(100),
          device_type VARCHAR(50),
          browser VARCHAR(100),
          os VARCHAR(100),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // User sessions table
      await db.run(`
        CREATE TABLE IF NOT EXISTS user_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id VARCHAR(255) UNIQUE NOT NULL,
          ip_address VARCHAR(45),
          user_agent TEXT,
          first_visit DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
          page_count INTEGER DEFAULT 1,
          time_spent INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT 1
        )
      `);

      // Popular pages table
      await db.run(`
        CREATE TABLE IF NOT EXISTS popular_pages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          page_url VARCHAR(255) UNIQUE NOT NULL,
          view_count INTEGER DEFAULT 0,
          unique_visitors INTEGER DEFAULT 0,
          last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('📊 Analytics tables initialized successfully');
    } catch (error) {
      console.error('Failed to initialize analytics tables:', error);
    }
  }

  async trackPageView(data) {
    try {
      const {
        pageUrl,
        userAgent,
        ipAddress,
        referrer,
        sessionId,
        country = null,
        city = null
      } = data;

      // Parse user agent for device info
      const deviceInfo = this.parseUserAgent(userAgent);

      // Insert page view
      await db.run(`
        INSERT INTO page_views (
          page_url, user_agent, ip_address, referrer, 
          country, city, device_type, browser, os
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        pageUrl, userAgent, ipAddress, referrer,
        country, city, deviceInfo.device, deviceInfo.browser, deviceInfo.os
      ]);

      // Update or create session
      await this.updateSession(sessionId, ipAddress, userAgent);

      // Update popular pages
      await this.updatePopularPages(pageUrl, ipAddress);

      return { success: true };
    } catch (error) {
      console.error('Failed to track page view:', error);
      return { success: false, error: error.message };
    }
  }

  async updateSession(sessionId, ipAddress, userAgent) {
    try {
      // Check if session exists
      const existingSession = await db.get(
        'SELECT * FROM user_sessions WHERE session_id = ?',
        [sessionId]
      );

      if (existingSession) {
        // Update existing session
        await db.run(`
          UPDATE user_sessions 
          SET last_activity = CURRENT_TIMESTAMP, 
              page_count = page_count + 1
          WHERE session_id = ?
        `, [sessionId]);
      } else {
        // Create new session
        await db.run(`
          INSERT INTO user_sessions (
            session_id, ip_address, user_agent
          ) VALUES (?, ?, ?)
        `, [sessionId, ipAddress, userAgent]);
      }
    } catch (error) {
      console.error('Failed to update session:', error);
    }
  }

  async updatePopularPages(pageUrl, ipAddress) {
    try {
      // Check if page exists in popular_pages
      const existingPage = await db.get(
        'SELECT * FROM popular_pages WHERE page_url = ?',
        [pageUrl]
      );

      if (existingPage) {
        // Check if this IP has visited this page today
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const visitedToday = await db.get(`
          SELECT COUNT(*) as count FROM page_views 
          WHERE page_url = ? AND ip_address = ? AND created_at >= ?
        `, [pageUrl, ipAddress, todayStart.toISOString()]);

        const isUniqueVisitor = visitedToday.count === 1;

        // Update page stats
        await db.run(`
          UPDATE popular_pages 
          SET view_count = view_count + 1,
              unique_visitors = unique_visitors + ?,
              last_updated = CURRENT_TIMESTAMP
          WHERE page_url = ?
        `, [isUniqueVisitor ? 1 : 0, pageUrl]);
      } else {
        // Create new page entry
        await db.run(`
          INSERT INTO popular_pages (page_url, view_count, unique_visitors)
          VALUES (?, 1, 1)
        `, [pageUrl]);
      }
    } catch (error) {
      console.error('Failed to update popular pages:', error);
    }
  }

  async getAnalyticsSummary(days = 30) {
    try {
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - days);

      // Total page views
      const totalViews = await db.get(`
        SELECT COUNT(*) as count FROM page_views 
        WHERE created_at >= ?
      `, [dateFrom.toISOString()]);

      // Unique visitors
      const uniqueVisitors = await db.get(`
        SELECT COUNT(DISTINCT ip_address) as count FROM page_views 
        WHERE created_at >= ?
      `, [dateFrom.toISOString()]);

      // Popular pages
      const popularPages = await db.all(`
        SELECT page_url, view_count, unique_visitors 
        FROM popular_pages 
        ORDER BY view_count DESC 
        LIMIT 10
      `);

      // Daily views for the last 30 days
      const dailyViews = await db.all(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as views,
          COUNT(DISTINCT ip_address) as unique_visitors
        FROM page_views 
        WHERE created_at >= ?
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 30
      `, [dateFrom.toISOString()]);

      // Device types
      const deviceTypes = await db.all(`
        SELECT 
          device_type,
          COUNT(*) as count
        FROM page_views 
        WHERE created_at >= ? AND device_type IS NOT NULL
        GROUP BY device_type
        ORDER BY count DESC
      `, [dateFrom.toISOString()]);

      // Browsers
      const browsers = await db.all(`
        SELECT 
          browser,
          COUNT(*) as count
        FROM page_views 
        WHERE created_at >= ? AND browser IS NOT NULL
        GROUP BY browser
        ORDER BY count DESC
        LIMIT 10
      `, [dateFrom.toISOString()]);

      // Referrers
      const referrers = await db.all(`
        SELECT 
          referrer,
          COUNT(*) as count
        FROM page_views 
        WHERE created_at >= ? AND referrer IS NOT NULL AND referrer != ''
        GROUP BY referrer
        ORDER BY count DESC
        LIMIT 10
      `, [dateFrom.toISOString()]);

      return {
        totalViews: totalViews.count,
        uniqueVisitors: uniqueVisitors.count,
        popularPages,
        dailyViews,
        deviceTypes,
        browsers,
        referrers,
        period: `${days} days`
      };
    } catch (error) {
      console.error('Failed to get analytics summary:', error);
      return null;
    }
  }

  async getRealtimeStats() {
    try {
      const last24Hours = new Date();
      last24Hours.setHours(last24Hours.getHours() - 24);

      // Active sessions (last 30 minutes)
      const activeSessionsTime = new Date();
      activeSessionsTime.setMinutes(activeSessionsTime.getMinutes() - 30);

      const activeSessions = await db.get(`
        SELECT COUNT(*) as count FROM user_sessions 
        WHERE last_activity >= ?
      `, [activeSessionsTime.toISOString()]);

      // Views in last 24 hours
      const recentViews = await db.get(`
        SELECT COUNT(*) as count FROM page_views 
        WHERE created_at >= ?
      `, [last24Hours.toISOString()]);

      // Hourly views for last 24 hours
      const hourlyViews = await db.all(`
        SELECT 
          strftime('%H', created_at) as hour,
          COUNT(*) as views
        FROM page_views 
        WHERE created_at >= ?
        GROUP BY strftime('%H', created_at)
        ORDER BY hour
      `, [last24Hours.toISOString()]);

      return {
        activeSessions: activeSessions.count,
        recentViews: recentViews.count,
        hourlyViews
      };
    } catch (error) {
      console.error('Failed to get realtime stats:', error);
      return null;
    }
  }

  parseUserAgent(userAgent) {
    if (!userAgent) {
      return { device: 'Unknown', browser: 'Unknown', os: 'Unknown' };
    }

    const ua = userAgent.toLowerCase();
    
    // Device detection
    let device = 'Desktop';
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      device = 'Mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      device = 'Tablet';
    }

    // Browser detection
    let browser = 'Unknown';
    if (ua.includes('chrome') && !ua.includes('edge')) {
      browser = 'Chrome';
    } else if (ua.includes('firefox')) {
      browser = 'Firefox';
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
      browser = 'Safari';
    } else if (ua.includes('edge')) {
      browser = 'Edge';
    } else if (ua.includes('opera')) {
      browser = 'Opera';
    }

    // OS detection
    let os = 'Unknown';
    if (ua.includes('windows')) {
      os = 'Windows';
    } else if (ua.includes('mac os')) {
      os = 'macOS';
    } else if (ua.includes('linux')) {
      os = 'Linux';
    } else if (ua.includes('android')) {
      os = 'Android';
    } else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) {
      os = 'iOS';
    }

    return { device, browser, os };
  }

  async cleanupOldData(daysToKeep = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      // Clean up old page views
      const result = await db.run(`
        DELETE FROM page_views 
        WHERE created_at < ?
      `, [cutoffDate.toISOString()]);

      // Clean up old inactive sessions
      await db.run(`
        DELETE FROM user_sessions 
        WHERE last_activity < ? AND is_active = 0
      `, [cutoffDate.toISOString()]);

      console.log(`🧹 Cleaned up ${result.changes} old analytics records`);
      return result.changes;
    } catch (error) {
      console.error('Failed to cleanup old analytics data:', error);
      return 0;
    }
  }
}

module.exports = new AnalyticsService();