const { Types } = require('mongoose');
const CmsEntry = require('../models/CmsEntry');
const CmsAuditLog = require('../models/CmsAuditLog');
const { sendSuccess } = require('../utils/response');
const { parsePagination, buildMeta } = require('../utils/pagination');

const editableStatuses = new Set(['draft', 'review', 'scheduled']);

const slugify = (value) => {
  const base = (value || '').toString().toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || `entry-${Date.now()}`;
};

const cleanStringArray = (value) =>
  Array.isArray(value)
    ? value
        .filter((v) => typeof v === 'string' && v.trim())
        .map((v) => v.trim())
    : [];

const logAction = async (entryId, action, userId, metadata = {}) => {
  try {
    await CmsAuditLog.create({ entry: entryId, action, performedBy: userId, metadata });
  } catch (err) {
    // Audit failures should not block primary flow
    console.error('Failed to write CMS audit log', err);
  }
};

const ensureEntryAccess = (entry, user) => {
  if (!entry) {
    return { status: 404, message: 'Entry not found' };
  }
  if (user.role !== 'admin' && entry.createdBy.toString() !== user.id) {
    return { status: 403, message: 'You do not have access to this entry' };
  }
  return null;
};

const parseDateOrThrow = (value, field) => {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    const error = new Error(`${field} is invalid`);
    error.status = 400;
    throw error;
  }
  return parsed;
};

const createEntry = async (req, res, next) => {
  try {
    const userId = req.user && req.user.id;
    const {
      title,
      slug,
      summary,
      body,
      type = 'page',
      tags,
      heroImage,
      status = 'draft',
      visibility = 'public',
      publishAt,
      seo,
      blocks
    } = req.body || {};

    if (!title || typeof title !== 'string' || !title.trim()) {
      return next({ status: 400, message: 'Title is required' });
    }

    if (!editableStatuses.has(status)) {
      return next({ status: 400, message: 'Status can only be draft, review, or scheduled at creation' });
    }

    const normalizedSlug = slugify(slug || title);
    const existing = await CmsEntry.findOne({ slug: normalizedSlug });
    if (existing) {
      return next({ status: 409, message: 'Slug already in use. Provide a unique slug.' });
    }

    const publishAtDate = status === 'scheduled' ? parseDateOrThrow(publishAt, 'publishAt') : undefined;

    const entry = await CmsEntry.create({
      title: title.trim(),
      slug: normalizedSlug,
      type,
      summary: summary || '',
      body: body || '',
      tags: cleanStringArray(tags),
      heroImage: heroImage || '',
      status,
      visibility,
      publishAt: publishAtDate,
      createdBy: userId,
      updatedBy: userId,
      seo: seo
        ? {
            title: seo.title,
            description: seo.description,
            keywords: cleanStringArray(seo.keywords)
          }
        : undefined,
      blocks: Array.isArray(blocks) ? blocks : undefined
    });

    await logAction(entry._id, 'create', userId, { status });

    res.status(201);
    return sendSuccess(res, entry);
  } catch (err) {
    return next(err);
  }
};

const listEntries = async (req, res, next) => {
  try {
    const user = req.user;
    const {
      status,
      type,
      visibility,
      tag,
      q
    } = req.query;

    const { limit, skip, sort, page } = parsePagination(req.query, {
      allowedSortFields: ['createdAt', 'updatedAt', 'publishAt', 'title', 'status'],
      defaultSort: { updatedAt: -1 }
    });

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (visibility) filter.visibility = visibility;
    if (tag) filter.tags = tag;
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { summary: { $regex: q, $options: 'i' } },
        { slug: { $regex: q, $options: 'i' } }
      ];
    }
    if (user.role !== 'admin') {
      filter.createdBy = user.id;
    }

    const [items, total] = await Promise.all([
      CmsEntry.find(filter)
        .sort(sort)
        .skip(skip || 0)
        .limit(limit || 0),
      CmsEntry.countDocuments(filter)
    ]);

    return sendSuccess(res, items, buildMeta(total, page, limit));
  } catch (err) {
    return next(err);
  }
};

const getEntry = async (req, res, next) => {
  try {
    const { entryId } = req.params;
    const includeLogs = req.query.includeLogs === 'true';

    if (!Types.ObjectId.isValid(entryId)) {
      return next({ status: 400, message: 'Invalid entryId' });
    }

    const entry = await CmsEntry.findById(entryId);
    const accessError = ensureEntryAccess(entry, req.user);
    if (accessError) {
      return next(accessError);
    }

    let auditTrail = [];
    if (includeLogs) {
      auditTrail = await CmsAuditLog.find({ entry: entryId })
        .sort({ createdAt: -1 })
        .limit(15);
    }

    return sendSuccess(res, { entry, auditTrail });
  } catch (err) {
    return next(err);
  }
};

const updateEntry = async (req, res, next) => {
  try {
    const { entryId } = req.params;
    if (!Types.ObjectId.isValid(entryId)) {
      return next({ status: 400, message: 'Invalid entryId' });
    }

    const entry = await CmsEntry.findById(entryId);
    const accessError = ensureEntryAccess(entry, req.user);
    if (accessError) {
      return next(accessError);
    }

    const {
      title,
      slug,
      summary,
      body,
      type,
      tags,
      heroImage,
      status,
      visibility,
      publishAt,
      seo,
      blocks
    } = req.body || {};

    if (title !== undefined) {
      if (!title || typeof title !== 'string' || !title.trim()) {
        return next({ status: 400, message: 'Title is required' });
      }
      entry.title = title.trim();
    }

    if (slug !== undefined) {
      const normalizedSlug = slugify(slug);
      const existing = await CmsEntry.findOne({ slug: normalizedSlug, _id: { $ne: entryId } });
      if (existing) {
        return next({ status: 409, message: 'Slug already in use. Provide a unique slug.' });
      }
      entry.slug = normalizedSlug;
    }

    if (summary !== undefined) entry.summary = summary || '';
    if (body !== undefined) entry.body = body || '';
    if (type !== undefined) entry.type = type;
    if (heroImage !== undefined) entry.heroImage = heroImage || '';
    if (visibility !== undefined) entry.visibility = visibility;
    if (Array.isArray(tags)) entry.tags = cleanStringArray(tags);
    if (Array.isArray(blocks)) entry.blocks = blocks;

    if (seo !== undefined) {
      entry.seo = {
        title: seo.title,
        description: seo.description,
        keywords: cleanStringArray(seo.keywords)
      };
    }

    if (status !== undefined) {
      if (!editableStatuses.has(status)) {
        return next({ status: 400, message: 'Status can only transition to draft, review, or scheduled here' });
      }
      entry.status = status;
      entry.publishAt = status === 'scheduled' ? parseDateOrThrow(publishAt, 'publishAt') : undefined;
      entry.publishedAt = status === 'scheduled' ? null : entry.publishedAt;
    } else if (publishAt !== undefined) {
      entry.publishAt = parseDateOrThrow(publishAt, 'publishAt');
    }

    entry.updatedBy = req.user && req.user.id;
    entry.version += 1;
    await entry.save();

    await logAction(entry._id, 'update', req.user.id, { status: entry.status });

    return sendSuccess(res, entry);
  } catch (err) {
    return next(err);
  }
};

const publishEntry = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return next({ status: 403, message: 'Only admins can publish or schedule content' });
    }

    const { entryId } = req.params;
    const { publishAt } = req.body || {};

    if (!Types.ObjectId.isValid(entryId)) {
      return next({ status: 400, message: 'Invalid entryId' });
    }

    const entry = await CmsEntry.findById(entryId);
    const accessError = ensureEntryAccess(entry, req.user);
    if (accessError) {
      return next(accessError);
    }

    const now = new Date();
    const publishDate = publishAt ? parseDateOrThrow(publishAt, 'publishAt') : now;
    const isScheduled = publishDate > now;

    entry.status = isScheduled ? 'scheduled' : 'published';
    entry.publishAt = publishDate;
    entry.publishedAt = isScheduled ? null : now;
    entry.archivedAt = null;
    entry.updatedBy = req.user && req.user.id;
    entry.version += 1;
    await entry.save();

    await logAction(entry._id, isScheduled ? 'schedule_publish' : 'publish', req.user.id, {
      publishAt: publishDate
    });

    return sendSuccess(res, entry);
  } catch (err) {
    return next(err);
  }
};

const archiveEntry = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return next({ status: 403, message: 'Only admins can archive content' });
    }

    const { entryId } = req.params;
    if (!Types.ObjectId.isValid(entryId)) {
      return next({ status: 400, message: 'Invalid entryId' });
    }

    const entry = await CmsEntry.findById(entryId);
    const accessError = ensureEntryAccess(entry, req.user);
    if (accessError) {
      return next(accessError);
    }

    entry.status = 'archived';
    entry.archivedAt = new Date();
    entry.updatedBy = req.user && req.user.id;
    entry.version += 1;
    await entry.save();

    await logAction(entry._id, 'archive', req.user.id);

    return sendSuccess(res, entry);
  } catch (err) {
    return next(err);
  }
};

const listPublicEntries = async (req, res, next) => {
  try {
    const now = new Date();
    const { type, tag, visibility = 'public' } = req.query;
    const { limit, skip, sort, page } = parsePagination(req.query, {
      allowedSortFields: ['publishAt', 'createdAt', 'title'],
      defaultSort: { publishAt: -1 }
    });

    const filter = {
      visibility,
      $or: [
        { status: 'published' },
        { status: 'scheduled', publishAt: { $lte: now } }
      ]
    };

    if (type) filter.type = type;
    if (tag) filter.tags = tag;

    const [items, total] = await Promise.all([
      CmsEntry.find(filter)
        .sort(sort)
        .skip(skip || 0)
        .limit(limit || 0),
      CmsEntry.countDocuments(filter)
    ]);

    return sendSuccess(res, items, buildMeta(total, page, limit));
  } catch (err) {
    return next(err);
  }
};

const getPublicEntryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const now = new Date();

    const entry = await CmsEntry.findOne({
      slug,
      visibility: 'public',
      $or: [
        { status: 'published' },
        { status: 'scheduled', publishAt: { $lte: now } }
      ]
    });

    if (!entry) {
      return next({ status: 404, message: 'Entry not found or not published' });
    }

    return sendSuccess(res, entry);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createEntry,
  listEntries,
  getEntry,
  updateEntry,
  publishEntry,
  archiveEntry,
  listPublicEntries,
  getPublicEntryBySlug
};
