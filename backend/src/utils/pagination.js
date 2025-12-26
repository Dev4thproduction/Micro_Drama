const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

const sanitizeSort = (sortParam, allowedFields, defaultSort) => {
  if (!sortParam) return defaultSort;
  const [field, dirRaw] = sortParam.split(':');
  if (!allowedFields.includes(field)) {
    return defaultSort;
  }
  const dir = dirRaw === 'asc' ? 1 : -1;
  return { [field]: dir };
};

const parsePagination = (query, options = {}) => {
  const allowedSortFields = options.allowedSortFields || ['createdAt'];
  const defaultSort = options.defaultSort || { createdAt: -1 };
  const rawPage = parseInt(query.page, 10);
  const rawLimit = parseInt(query.limit, 10);
  const shouldPaginate = Number.isInteger(rawPage) || Number.isInteger(rawLimit);

  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const limitCandidate = Number.isInteger(rawLimit) && rawLimit > 0 ? rawLimit : DEFAULT_LIMIT;
  const limit = Math.min(limitCandidate, MAX_LIMIT);
  const sort = sanitizeSort(query.sort, allowedSortFields, defaultSort);

  return {
    page,
    limit: shouldPaginate ? limit : undefined,
    skip: shouldPaginate ? (page - 1) * limit : undefined,
    sort
  };
};

const buildMeta = (total, page, limit) => {
  if (!limit) {
    return { total };
  }
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return { total, page, limit, totalPages };
};

module.exports = { parsePagination, buildMeta };
