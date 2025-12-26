// Basic error handler for unexpected errors with consistent response shape
const errorHandler = (err, req, res, next) => {
  const status = typeof err.status === 'number' ? err.status : 500;
  const message = err.message || 'Internal Server Error';

  console.error(
    `[ERR] ${req.method} ${req.originalUrl} -> ${status} : ${message}`,
    process.env.NODE_ENV === 'development' ? err.stack : undefined
  );

  res.status(status).json({
    error: {
      message,
      status
    }
  });
};

module.exports = errorHandler;
