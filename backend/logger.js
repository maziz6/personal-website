// server/utils/logger.js - Logging utility
const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatLogEntry(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...meta
    };
    
    return JSON.stringify(logEntry);
  }

  writeToFile(filename, content) {
    const filePath = path.join(this.logDir, filename);
    const logLine = content + '\n';
    
    fs.appendFile(filePath, logLine, (err) => {
      if (err) {
        console.error('Failed to write to log file:', err);
      }
    });
  }

  getLogFileName(type = 'app') {
    const date = new Date().toISOString().split('T')[0];
    return `${type}-${date}.log`;
  }

  info(message, meta = {}) {
    const logEntry = this.formatLogEntry('info', message, meta);
    console.log(`ℹ️  ${message}`, meta);
    this.writeToFile(this.getLogFileName('app'), logEntry);
  }

  error(message, error = null, meta = {}) {
    const errorMeta = {
      ...meta,
      ...(error && {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        }
      })
    };
    
    const logEntry = this.formatLogEntry('error', message, errorMeta);
    console.error(`❌ ${message}`, error || meta);
    this.writeToFile(this.getLogFileName('error'), logEntry);
  }

  warn(message, meta = {}) {
    const logEntry = this.formatLogEntry('warn', message, meta);
    console.warn(`⚠️  ${message}`, meta);
    this.writeToFile(this.getLogFileName('app'), logEntry);
  }

  debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development') {
      const logEntry = this.formatLogEntry('debug', message, meta);
      console.log(`🐛 ${message}`, meta);
      this.writeToFile(this.getLogFileName('debug'), logEntry);
    }
  }

  access(req, res, responseTime) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      status: res.statusCode,
      responseTime: `${responseTime}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent') || 'Unknown'
    };

    const logString = JSON.stringify(logEntry);
    this.writeToFile(this.getLogFileName('access'), logString);
    
    // Console output with colors
    const statusColor = res.statusCode >= 400 ? '🔴' : 
                       res.statusCode >= 300 ? '🟡' : '🟢';
    console.log(`${statusColor} ${req.method} ${req.url} - ${res.statusCode} - ${responseTime}ms`);
  }

  security(event, details = {}) {
    const logEntry = this.formatLogEntry('security', event, {
      severity: 'high',
      ...details
    });
    
    console.warn(`🔒 SECURITY: ${event}`, details);
    this.writeToFile(this.getLogFileName('security'), logEntry);
  }

  api(endpoint, method, status, responseTime, details = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      endpoint,
      method,
      status,
      responseTime: `${responseTime}ms`,
      ...details
    };

    const logString = JSON.stringify(logEntry);
    this.writeToFile(this.getLogFileName('api'), logString);
  }

  database(query, duration, error = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      query: query.replace(/\s+/g, ' ').trim(),
      duration: `${duration}ms`,
      ...(error && { error: error.message })
    };

    const logString = JSON.stringify(logEntry);
    this.writeToFile(this.getLogFileName('database'), logString);

    if (error) {
      console.error(`🗄️  DB Error: ${error.message}`);
    } else if (process.env.NODE_ENV === 'development') {
      console.log(`🗄️  DB Query: ${duration}ms`);
    }
  }

  email(to, subject, status, error = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      to,
      subject,
      status,
      ...(error && { error: error.message })
    };

    const logString = JSON.stringify(logEntry);
    this.writeToFile(this.getLogFileName('email'), logString);

    if (status === 'sent') {
      console.log(`📧 Email sent to ${to}: ${subject}`);
    } else {
      console.error(`📧 Email failed to ${to}: ${error?.message}`);
    }
  }

  // Clean old log files (keep last 30 days)
  cleanOldLogs() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    fs.readdir(this.logDir, (err, files) => {
      if (err) return;
      
      files.forEach(file => {
        const filePath = path.join(this.logDir, file);
        fs.stat(filePath, (err, stats) => {
          if (err) return;
          
          if (stats.mtime < thirtyDaysAgo) {
            fs.unlink(filePath, (err) => {
              if (!err) {
                console.log(`🗑️  Cleaned old log file: ${file}`);
              }
            });
          }
        });
      });
    });
  }

  // Get log statistics
  async getLogStats(days = 7) {
    const stats = {
      totalRequests: 0,
      errorCount: 0,
      averageResponseTime: 0,
      topEndpoints: {},
      statusCodes: {}
    };

    try {
      const files = fs.readdirSync(this.logDir);
      const accessLogFiles = files.filter(f => f.startsWith('access-'));
      
      let totalResponseTime = 0;
      let requestCount = 0;
      
      for (const file of accessLogFiles) {
        const filePath = path.join(this.logDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const entry = JSON.parse(line);
            const responseTime = parseInt(entry.responseTime);
            
            stats.totalRequests++;
            totalResponseTime += responseTime;
            requestCount++;
            
            // Count status codes
            stats.statusCodes[entry.status] = (stats.statusCodes[entry.status] || 0) + 1;
            
            // Count endpoints
            const endpoint = `${entry.method} ${entry.url}`;
            stats.topEndpoints[endpoint] = (stats.topEndpoints[endpoint] || 0) + 1;
            
            // Count errors
            if (entry.status >= 400) {
              stats.errorCount++;
            }
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      }
      
      stats.averageResponseTime = requestCount > 0 ? Math.round(totalResponseTime / requestCount) : 0;
      
      // Sort top endpoints
      stats.topEndpoints = Object.entries(stats.topEndpoints)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
        
    } catch (error) {
      this.error('Failed to generate log statistics', error);
    }
    
    return stats;
  }
}

// Create singleton instance
const logger = new Logger();

// Clean old logs on startup
logger.cleanOldLogs();

// Clean old logs daily
setInterval(() => {
  logger.cleanOldLogs();
}, 24 * 60 * 60 * 1000);

module.exports = logger;