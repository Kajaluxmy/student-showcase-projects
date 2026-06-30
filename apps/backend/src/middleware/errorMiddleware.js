const env = require('../config/env');

function errorMiddleware(err, req, res, next) {
  // Log the complete error stack internally for monitoring/debugging
  console.error('💥 Unhandled application error:', err);

  const isProduction = env.NODE_ENV === 'production';
  
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected error occurred';
  let details = err.details || null;

  // Catch generic validation error shape if thrown
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_FAILED';
    message = 'Request parameter validation failed';
    details = err.details;
  }

  // Handle MySQL errors safely without leaking structure
  if (err.code && err.code.startsWith('ER_')) {
    statusCode = 500;
    code = 'DATABASE_ERROR';
    message = isProduction 
      ? 'A database operations error occurred.' 
      : `Database Error: ${err.message} (${err.code})`;
    details = isProduction ? null : err.sql;
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
      ...(!isProduction && { stack: err.stack })
    }
  });
}

module.exports = errorMiddleware;
