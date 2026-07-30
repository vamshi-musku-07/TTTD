function errorHandler(err, _req, res, _next) {
  let status = err.status || 500;
  let message = err.message || 'Internal server error';

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors || {})
      .map((e) => e.message)
      .join(', ') || 'Validation failed';
  }

  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid ID';
  }

  if (status >= 500) {
    console.error('[error]', err);
  } else {
    console.warn(`[error] ${status}: ${message}`);
  }

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && status >= 500 ? { stack: err.stack } : {}),
  });
}

module.exports = { errorHandler };
