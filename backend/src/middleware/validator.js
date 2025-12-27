const sanitizeStringArray = (arr, maxItems = 20, maxLen = 120) => {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((v) => typeof v === 'string')
    .map((v) => v.trim())
    .filter(Boolean)
    .slice(0, maxItems)
    .map((v) => v.slice(0, maxLen));
};

const validatePositiveInt = (value, field) => {
  if (!Number.isInteger(value) || value < 1) {
    const err = new Error(`${field} must be a positive integer`);
    err.status = 400;
    throw err;
  }
};

const ensureOwnerOrAdmin = (resourceOwnerId, user) => {
  if (!user || !user.id) return false;
  if (user.role === 'admin') return true;
  return resourceOwnerId && resourceOwnerId.toString() === user.id;
};

module.exports = { sanitizeStringArray, validatePositiveInt, ensureOwnerOrAdmin };
