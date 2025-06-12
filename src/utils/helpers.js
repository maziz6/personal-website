// server/utils/helpers.js - Utility functions for the server
const crypto = require('crypto');
const path = require('path');
const fs = require('fs').promises;

/**
 * Generate a unique session ID
 */
function generateSessionId() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate a secure random token
 */
function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash a string using SHA-256
 */
function hashString(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

/**
 * Get client IP address from request
 */
function getClientIP(req) {
  return req.headers['x-forwarded-for'] || 
         req.headers['x-real-ip'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         '127.0.0.1';
}

/**
 * Parse User Agent to extract browser and OS info
 */
function parseUserAgent(userAgent) {
  const ua = userAgent || '';
  
  // Simple user agent parsing (you might want to use a library like 'ua-parser-js' for more accuracy)
  const browser = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/i)?.[1] || 'Unknown';
  const os = ua.includes('Windows') ? 'Windows' :
             ua.includes('Mac') ? 'macOS' :
             ua.includes('Linux') ? 'Linux' :
             ua.includes('Android') ? 'Android' :
             ua.includes('iOS') ? 'iOS' : 'Unknown';
  
  const deviceType = ua.includes('Mobile') ? 'mobile' :
                     ua.includes('Tablet') ? 'tablet' : 'desktop';

  return { browser, os, deviceType };
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize input to prevent XSS
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove < and > characters
    .trim()
    .slice(0, 1000); // Limit length
}

/**
 * Format date for database storage
 */
function formatDateForDB(date = new Date()) {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

/**
 * Calculate pagination info
 */
function calculatePagination(page, limit, totalCount) {
  const currentPage = Math.max(1, parseInt(page) || 1);
  const itemsPerPage = Math.max(1, Math.min(100, parseInt(limit) || 10));
  const offset = (currentPage - 1) * itemsPerPage;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  
  return {
    currentPage,
    itemsPerPage,
    offset,
    totalPages,
    totalCount,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1
  };
}

/**
 * Delay execution (useful for rate limiting)
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create directory if it doesn't exist
 */
async function ensureDir(dirPath) {
  try {
    await fs.access(dirPath);
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Generate file name with timestamp
 */
function generateFileName(originalName, prefix = '') {
  const timestamp = Date.now();
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);
  return `${prefix}${name}_${timestamp}${ext}`;
}

/**
 * Validate file type
 */
function isValidFileType(filename, allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']) {
  const ext = path.extname(filename).toLowerCase().slice(1);
  return allowedTypes.includes(ext);
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generate slug from text
 */
function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Check if request is from mobile device
 */
function isMobileDevice(userAgent) {
  const mobilePlatforms = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return mobilePlatforms.test(userAgent);
}

/**
 * Generate random color
 */
function generateRandomColor() {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Validate URL format
 */
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Get time difference in human-readable format
 */
function getTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  return `${Math.floor(diffInSeconds / 31536000)}y ago`;
}

/**
 * Clean and validate JSON
 */
function parseJSON(str, defaultValue = null) {
  try {
    return JSON.parse(str);
  } catch (error) {
    return defaultValue;
  }
}

/**
 * Rate limiting helper
 */
function createRateLimitStore() {
  const store = new Map();
  
  return {
    get: (key) => store.get(key),
    set: (key, value, ttl) => {
      store.set(key, value);
      if (ttl) {
        setTimeout(() => store.delete(key), ttl * 1000);
      }
    },
    delete: (key) => store.delete(key),
    clear: () => store.clear(),
    size: () => store.size
  };
}

module.exports = {
  generateSessionId,
  generateToken,
  hashString,
  getClientIP,
  parseUserAgent,
  isValidEmail,
  sanitizeInput,
  formatDateForDB,
  calculatePagination,
  delay,
  ensureDir,
  generateFileName,
  isValidFileType,
  formatFileSize,
  generateSlug,
  escapeHtml,
  isMobileDevice,
  generateRandomColor,
  isValidUrl,
  getTimeAgo,
  parseJSON,
  createRateLimitStore
};