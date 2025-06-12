// server/server.js - 2025-Ready Express Server
require('dotenv-expand').expand(require('dotenv').config());

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Utilities and services
const logger = require('./utils/logger');
const { getClientIP, parseUserAgent } = require('./utils/helpers');
const errorHandler = require('./middleware/errorHandler');

// Routes
const contactRoutes = require('./routes/contact');
const feedbackRoutes = require('./routes/feedback');
const visitorRoutes = require('./routes/visitor');
const projectsRoutes = require('./routes/projects');
const analyticsRoutes = require('./routes/analytics');
const adminRoutes = require('./routes/admin');

// Database
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

app.set('trust proxy', true);

const express = require('express');
const corsMiddleware = require('./middleware/cors');

app.use(corsMiddleware); // Plug it in globally


// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

app.use(compression());
app.use(cors({
  origin: (origin, callback) => {
    const allowed = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];
    if (!origin || allowed.includes(origin)) return callback(null, true);
    logger.security('CORS blocked', { origin });
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  handler: (req, res) => {
    logger.security('Rate limit exceeded', {
      ip: getClientIP(req),
      userAgent: req.get('User-Agent'),
      url: req.url
    });
    res.status(429).json({ success: false, message: 'Rate limit exceeded.' });
  }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    logger.access(req, res, Date.now() - start);
    originalEnd.call(this, chunk, encoding);
  };
  next();
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880') },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const isValid = allowed.test(file.mimetype) && allowed.test(path.extname(file.originalname).toLowerCase());
    isValid ? cb(null, true) : cb(new Error('Unsupported file type.'));
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/status', async (req, res) => {
  try {
    const dbStatus = await new Promise((resolve) => db.get('SELECT 1', err => resolve(err ? 'error' : 'connected')));
    const stats = await logger.getLogStats?.(1) || {};
    res.json({ success: true, status: 'ok', database: dbStatus, stats });
  } catch (err) {
    logger.error('Status check failed', err);
    res.status(500).json({ success: false, status: 'error' });
  }
});

app.use('/api/contact', contactRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
  logger.info('Uploaded file', req.file);
  res.json({ success: true, file: { ...req.file, url: `/uploads/${req.file.filename}` } });
});

if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../build');
  app.use(express.static(buildPath));
  app.get('*', (req, res) => res.sendFile(path.join(buildPath, 'index.html')));
}

app.use('/api/*', (req, res) => res.status(404).json({ success: false, message: 'API endpoint not found' }));
app.use(errorHandler);

const server = app.listen(PORT, HOST, () => {
  logger.info(`Server running at http://${HOST}:${PORT}`);
});

const gracefulShutdown = (signal) => {
  logger.info(`Graceful shutdown: ${signal}`);
  server.close(() => {
    db.close(err => {
      if (err) logger.error('DB close error', err);
      else logger.info('DB closed');
      process.exit(0);
    });
  });

  setTimeout(() => {
    logger.error('Force shutdown');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

server.on('error', (err) => {
  const bind = typeof PORT === 'string' ? `Pipe ${PORT}` : `Port ${PORT}`;
  switch (err.code) {
    case 'EACCES':
      logger.error(`${bind} requires elevated privileges`);
      break;
    case 'EADDRINUSE':
      logger.error(`${bind} is already in use`);
      break;
    default:
      throw err;
  }
  process.exit(1);
});

module.exports = app;
