const jwt = require('jsonwebtoken');
const config = require('../config/env');

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const [, token] = authHeader.split(' ');

  if (!token) {
    return next({ status: 401, message: 'Authorization token missing' });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = { id: payload.id, role: payload.role };
    return next();
  } catch (err) {
    return next({ status: 401, message: 'Invalid or expired token' });
  }
};

const buildRoleChecker = (roles) => {
  const allowed = new Set(Array.isArray(roles) ? roles : [roles]);
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next({ status: 401, message: 'Authentication required' });
    }
    if (!allowed.has(req.user.role)) {
      return next({ status: 403, message: 'Insufficient permissions for this action' });
    }
    return next();
  };
};

// Use inside routes: router.get(..., allowRoles(['admin']), handler)
const allowRoles = (roles) => [requireAuth, buildRoleChecker(roles)];

// For cases where auth is already ensured earlier in the chain
const requireRole = (roles) => buildRoleChecker(roles);

module.exports = { requireAuth, requireRole, allowRoles };
