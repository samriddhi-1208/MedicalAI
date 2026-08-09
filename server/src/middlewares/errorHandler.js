// Global API Error Handler Middleware
module.exports = (err, req, res, next) => {
  console.error('[API Error]:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
};
