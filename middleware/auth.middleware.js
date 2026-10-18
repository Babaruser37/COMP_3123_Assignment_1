const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Authentication failed: Missing or malformed token header', { path: req.originalUrl });
    return res.status(401).json({
      status: false,
      message: 'Access denied. No token provided or invalid format.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn(`Authentication failed: ${error.message}`, { path: req.originalUrl });
    return res.status(401).json({
      status: false,
      message: 'Invalid or expired token.'
    });
  }
};

module.exports = verifyToken;