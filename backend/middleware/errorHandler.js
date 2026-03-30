/**
 * Global error handler middleware.
 * Catches any unhandled errors and returns a consistent JSON response.
 * Must be registered LAST with app.use().
 */
const errorHandler = (err, req, res, next) => {
  console.error(`❌ [${new Date().toISOString()}] ${req.method} ${req.path}`, err.message);

  // Supabase-specific errors
  if (err.code && err.message && err.details) {
    return res.status(400).json({
      error: 'Database error',
      message: err.message,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Authentication failed', message: err.message });
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal server error' : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
