const logger = require('../utils/logger');

// 404 handler
const notFoundHandler = (req, res) => {
  logger.warn(`Route not found: ${req.originalUrl}`);
  res.status(404).json({ error: 'Route not found' });
};

// Global error handler
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  logger.error(`Error: ${err.message}`, { 
    url: req.originalUrl,
    method: req.method,
    stack: err.stack
  });
  
  res.status(statusCode).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
