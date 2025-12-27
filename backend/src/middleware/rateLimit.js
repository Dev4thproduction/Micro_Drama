// Lightweight in-memory rate limiter (per IP and optional key).
// NOTE: For production, replace with a distributed limiter (Redis, etc.).
const buckets = new Map();

const rateLimit = ({ windowMs = 60_000, max = 30, keyGenerator }) => {
  return (req, res, next) => {
    const now = Date.now();
    const key = keyGenerator ? keyGenerator(req) : req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const bucket = buckets.get(key) || [];

    const fresh = bucket.filter((ts) => now - ts < windowMs);
    fresh.push(now);

    buckets.set(key, fresh);

    if (fresh.length > max) {
      return next({ status: 429, message: 'Too many requests. Please slow down.' });
    }
    next();
  };
};

module.exports = rateLimit;
