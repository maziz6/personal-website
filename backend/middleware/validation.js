// server/middleware/validation.js - Modernized 2025 Middleware
const { body, query, param, validationResult } = require('express-validator');

// Unified error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// 💌 Contact Validation
const contactValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2–100 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name must contain only letters and spaces'),

  body('email')
    .isEmail().normalizeEmail().withMessage('Enter a valid email address'),

  body('subject')
    .trim()
    .isLength({ min: 5, max: 200 }).withMessage('Subject must be between 5–200 characters'),

  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 }).withMessage('Message must be 10–2000 characters'),

  handleValidationErrors
];

// 🌟 Feedback Validation
const feedbackValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2–100 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name must contain only letters and spaces'),

  body('email')
    .optional()
    .isEmail().normalizeEmail().withMessage('Invalid email'),

  body('rating')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1–5'),

  body('comment')
    .trim()
    .isLength({ min: 10, max: 1000 }).withMessage('Comment must be 10–1000 characters'),

  body('category')
    .optional()
    .isIn(['general', 'portfolio', 'projects', 'skills', 'experience'])
    .withMessage('Invalid category'),

  handleValidationErrors
];

// 💻 Project Validation
const projectValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Title must be 3–100 characters'),

  body('description')
    .trim()
    .isLength({ min: 20, max: 500 }).withMessage('Description must be 20–500 characters'),

  body('technologies')
    .isArray({ min: 1 }).withMessage('Provide at least one technology'),

  body('technologies.*')
    .trim()
    .isLength({ min: 1, max: 50 }).withMessage('Tech names must be 1–50 characters'),

  body('category')
    .isIn(['web', 'mobile', 'desktop', 'api', 'other'])
    .withMessage('Invalid project category'),

  body('status')
    .optional()
    .isIn(['completed', 'in-progress', 'planned'])
    .withMessage('Invalid project status'),

  body('github_url')
    .optional()
    .isURL().withMessage('GitHub URL must be valid'),

  body('live_url')
    .optional()
    .isURL().withMessage('Live URL must be valid'),

  handleValidationErrors
];

// 🔢 Pagination / Query
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be >= 1'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be 1–100'),

  handleValidationErrors
];

// 🆔 ID Param
const idValidation = [
  param('id')
    .isMongoId().withMessage('Invalid ID format'),

  handleValidationErrors
];

// 🧼 Basic HTML Sanitizer
const sanitizeHtml = (req, res, next) => {
  const fields = ['message', 'comment', 'description'];
  fields.forEach(field => {
    if (req.body?.[field]) {
      req.body[field] = req.body[field]
        .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/javascript:/gi, '');
    }
  });
  next();
};

module.exports = {
  contactValidation,
  feedbackValidation,
  projectValidation,
  paginationValidation,
  idValidation,
  sanitizeHtml,
  handleValidationErrors
};
