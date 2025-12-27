// Simple request logger for method, path, status, and duration
const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;
    const id = req.requestId || '-';
    console.log(`[REQ] ${id} ${method} ${originalUrl} -> ${statusCode} (${durationMs}ms)`);
  });
  next();
};

module.exports = requestLogger;
