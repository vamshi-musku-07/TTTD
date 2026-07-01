function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  if (status >= 500) {
    console.error('[error]', err);
  }

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && status >= 500 ? { stack: err.stack } : {}),
  });
}

module.exports = { errorHandler };
