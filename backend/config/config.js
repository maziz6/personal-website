// config/index.js - Centralized application config (2025-ready)
require('dotenv-expand').expand(require('dotenv').config());
const chalk = require('chalk');

function required(name) {
  const value = process.env[name];
  if (!value) {
    console.warn(chalk.yellow(`⚠️  Warning: Missing required env variable '${name}'`));
  }
  return value || `MISSING_${name}`;
}

module.exports = {
  port: process.env.PORT || 5000,

  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio',

  jwt: {
    secret: required('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    user: required('EMAIL_USER'),
    pass: required('EMAIL_PASS'),
    from: process.env.EMAIL_FROM || 'noreply@yourportfolio.com',
    replyTo: process.env.EMAIL_REPLY_TO || undefined
  },

  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000'
  },

  server: {
    env: process.env.NODE_ENV || 'development',
    host: process.env.HOST || 'localhost',
    allowOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
      .split(',')
      .map(origin => origin.trim())
  }
};
