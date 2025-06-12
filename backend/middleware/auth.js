// middleware/auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123'; // 👈 You should always override this in .env

/**
 * Middleware to authenticate JWT token from Authorization header
 */
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Missing or invalid token'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // decoded contains payload like { id, email, role }
    next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Invalid or expired token'
    });
  }
};

/**
 * Middleware to restrict access to admin users
 */
const authorizeAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Admins only'
    });
  }
  next();
};

/**
 * Optional: Middleware to check if the user owns the resource or is admin
 */
const authorizeOwnerOrAdmin = (resourceUserIdField = 'id') => {
  return (req, res, next) => {
    const userId = req.user?.id;
    const resourceOwnerId = req.params[resourceUserIdField] || req.body[resourceUserIdField];

    if (userId !== resourceOwnerId && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Not resource owner or admin'
      });
    }
    next();
  };
};

module.exports = {
  authenticateUser,
  authorizeAdmin,
  authorizeOwnerOrAdmin
};
