const { randomUUID } = require('crypto');

// Attach a request-scoped id for tracing across logs and responses.
const requestId = (req, res, next) => {
  const id = req.headers['x-request-id'] || randomUUID();
  req.requestId = id;
  res.setHeader('X-Request-ID', id);
  next();
};

module.exports = requestId;
