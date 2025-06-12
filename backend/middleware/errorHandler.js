
// server/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === 'development';

  // Default structure
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose: Invalid ObjectId
  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Mongoose: Duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate field: ${field}`;
  }

  // Mongoose: Validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  // SQLite: Constraint violation
  if (err.code === 'SQLITE_CONSTRAINT') {
    statusCode = 400;
    message = 'Database constraint violation';
  }

  // JWT: Invalid or expired
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired';
  }

  // Rate limiting
  if (err.status === 429) {
    statusCode = 429;
    message = 'Too many requests, please try again later';
  }

  // Log errors clearly in development
  if (isDev) {
    console.error('\n[🔥 ERROR STACK TRACE]');
    console.error(err.stack || err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(isDev && { stack: err.stack })
  });
};

module.exports = errorHandler;
