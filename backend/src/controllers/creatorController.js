const { Types } = require('mongoose');
const Series = require('../models/Series');
const Episode = require('../models/Episode');
const Video = require('../models/Video');
const { sendSuccess } = require('../utils/response');
const { parsePagination, buildMeta } = require('../utils/pagination');
const { sanitizeStringArray, ensureOwnerOrAdmin, validatePositiveInt } = require('../middleware/validator');

const createSeries = async (req, res, next) => {
  try {
    const { title, description, tags, thumbnail } = req.body || {};
    const creatorId = req.user && req.user.id;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return next({ status: 400, message: 'Title is required' });
    }

    const safeTags = sanitizeStringArray(tags);

    const series = await Series.create({
      title: title.trim(),
      description: description || '',
      thumbnail: thumbnail || '',
      tags: safeTags,
      creator: creatorId,
      status: 'pending'
    });

    res.status(201);
    return sendSuccess(res, series);
  } catch (err) {
    return next(err);
  }
};

const listSeries = async (req, res, next) => {
  try {
    const creatorId = req.user && req.user.id;
    const { limit, skip, sort, page } = parsePagination(req.query, {
      allowedSortFields: ['createdAt', 'title'],
      defaultSort: { createdAt: -1 }
    });
    const filter = { creator: creatorId };

    const [items, total] = await Promise.all([
      Series.find(filter)
        .sort(sort)
        .skip(skip || 0)
        .limit(limit || 0),
      Series.countDocuments(filter)
    ]);

    return sendSuccess(res, items, buildMeta(total, page, limit));
  } catch (err) {
    return next(err);
  }
};

const createEpisode = async (req, res, next) => {
  try {
    const creatorId = req.user && req.user.id;
    const { seriesId } = req.params;
    const { title, synopsis, order, releaseDate, video, thumbnail } = req.body || {};

    if (!Types.ObjectId.isValid(seriesId)) {
      return next({ status: 400, message: 'Invalid seriesId' });
    }
    if (!title || typeof title !== 'string' || !title.trim()) {
      return next({ status: 400, message: 'Title and order are required' });
    }
    try {
      validatePositiveInt(order, 'order');
    } catch (err) {
      return next(err);
    }
    if (video && !Types.ObjectId.isValid(video)) {
      return next({ status: 400, message: 'Invalid video id' });
    }
    let normalizedReleaseDate;
    if (releaseDate) {
      const parsed = new Date(releaseDate);
      if (Number.isNaN(parsed.getTime())) {
        return next({ status: 400, message: 'releaseDate is invalid' });
      }
      normalizedReleaseDate = parsed;
    }

    const series = await Series.findById(seriesId);
    if (!series) {
      return next({ status: 404, message: 'Series not found' });
    }
    if (!ensureOwnerOrAdmin(series.creator, req.user)) {
      return next({ status: 403, message: 'You do not have access to this series' });
    }

    let videoDoc;
    if (video) {
      videoDoc = await Video.findById(video);
      if (!videoDoc) {
        return next({ status: 404, message: 'Video not found' });
      }
      if (!ensureOwnerOrAdmin(videoDoc.owner, req.user)) {
        return next({ status: 403, message: 'You do not have access to this video' });
      }
    }

    const episode = await Episode.create({
      series: seriesId,
      title: title.trim(),
      synopsis: synopsis || '',
      thumbnail: thumbnail || '',
      order,
      releaseDate: normalizedReleaseDate,
      status: 'pending',
      video
    });

    res.status(201);
    return sendSuccess(res, episode);
  } catch (err) {
    return next(err);
  }
};

const listEpisodes = async (req, res, next) => {
  try {
    const creatorId = req.user && req.user.id;
    const { seriesId } = req.params;

    if (!Types.ObjectId.isValid(seriesId)) {
      return next({ status: 400, message: 'Invalid seriesId' });
    }

    const series = await Series.findById(seriesId);
    if (!series) {
      return next({ status: 404, message: 'Series not found' });
    }
    if (!ensureOwnerOrAdmin(series.creator, req.user)) {
      return next({ status: 403, message: 'You do not have access to this series' });
    }

    const { limit, skip, sort, page } = parsePagination(req.query, {
      allowedSortFields: ['createdAt', 'order', 'releaseDate'],
      defaultSort: { order: 1 }
    });

    const filter = { series: seriesId };
    const [episodes, total] = await Promise.all([
      Episode.find(filter)
        .sort(sort)
        .skip(skip || 0)
        .limit(limit || 0),
      Episode.countDocuments(filter)
    ]);

    return sendSuccess(res, episodes, buildMeta(total, page, limit));
  } catch (err) {
    return next(err);
  }
};

const createVideo = async (req, res, next) => {
  try {
    const ownerId = req.user && req.user.id;
    const { s3Key, storageUrl, durationSeconds, sizeBytes, format, resolution } = req.body || {};

    if (!s3Key || typeof s3Key !== 'string') {
      return next({ status: 400, message: 's3Key is required' });
    }
    if (durationSeconds !== undefined && (typeof durationSeconds !== 'number' || durationSeconds < 0)) {
      return next({ status: 400, message: 'durationSeconds must be a non-negative number' });
    }
    if (sizeBytes !== undefined && (typeof sizeBytes !== 'number' || sizeBytes < 0)) {
      return next({ status: 400, message: 'sizeBytes must be a non-negative number' });
    }

    const video = await Video.create({
      s3Key,
      owner: ownerId,
      storageUrl: storageUrl || s3Key,
      durationSeconds,
      sizeBytes,
      format,
      resolution,
      status: 'pending'
    });

    res.status(201);
    return sendSuccess(res, video);
  } catch (err) {
    return next(err);
  }
};

const deleteVideo = async (req, res, next) => {
  try {
    const ownerId = req.user && req.user.id;
    const { videoId } = req.params;

    if (!Types.ObjectId.isValid(videoId)) {
      return next({ status: 400, message: 'Invalid video id' });
    }

    const video = await Video.findById(videoId);
    if (!video) {
      return next({ status: 404, message: 'Video not found' });
    }
    if (!ensureOwnerOrAdmin(video.owner, req.user)) {
      return next({ status: 403, message: 'You do not have access to this video' });
    }

    const isInUse = await Episode.exists({ video: videoId });
    if (isInUse) {
      return next({ status: 400, message: 'Video is attached to an episode and cannot be deleted' });
    }

    await video.deleteOne();
    return sendSuccess(res, { deleted: true });
  } catch (err) {
    return next(err);
  }
};

const updateVideoStatus = async (req, res, next) => {
  try {
    const ownerId = req.user && req.user.id;
    const { videoId } = req.params;
    const { status, note } = req.body || {};

    if (!Types.ObjectId.isValid(videoId)) {
      return next({ status: 400, message: 'Invalid video id' });
    }
    const allowedStatuses = ['pending', 'processing', 'ready', 'failed'];
    if (!status || !allowedStatuses.includes(status)) {
      return next({ status: 400, message: 'Invalid status. Allowed: pending, processing, ready, failed' });
    }

    const video = await Video.findById(videoId);
    if (!video) {
      return next({ status: 404, message: 'Video not found' });
    }
    if (!ensureOwnerOrAdmin(video.owner, req.user)) {
      return next({ status: 403, message: 'You do not have access to this video' });
    }

    video.status = status;
    video.processingNote = typeof note === 'string' ? note.trim() : undefined;
    await video.save();

    return sendSuccess(res, video);
  } catch (err) {
    return next(err);
  }
};

const listVideos = async (req, res, next) => {
  try {
    const ownerId = req.user && req.user.id;
    const { limit, skip, sort, page } = parsePagination(req.query, {
      allowedSortFields: ['createdAt'],
      defaultSort: { createdAt: -1 }
    });
    const filter = { owner: ownerId };

    const [videos, total] = await Promise.all([
      Video.find(filter)
        .sort(sort)
        .skip(skip || 0)
        .limit(limit || 0),
      Video.countDocuments(filter)
    ]);
    return sendSuccess(res, videos, buildMeta(total, page, limit));
  } catch (err) {
    return next(err);
  }
};

const updateSeries = async (req, res, next) => {
  try {
    const ownerId = req.user && req.user.id;
    const { seriesId } = req.params;
    const { title, description, tags, status, thumbnail } = req.body || {};

    if (!Types.ObjectId.isValid(seriesId)) {
      return next({ status: 400, message: 'Invalid seriesId' });
    }

    const series = await Series.findById(seriesId);
    if (!series) {
      return next({ status: 404, message: 'Series not found' });
    }
    if (!ensureOwnerOrAdmin(series.creator, req.user)) {
      return next({ status: 403, message: 'You do not have access to this series' });
    }

    if (title !== undefined) {
      if (!title || typeof title !== 'string' || !title.trim()) {
        return next({ status: 400, message: 'Title is required' });
      }
      series.title = title.trim();
    }
    if (description !== undefined) series.description = description || '';
    if (thumbnail !== undefined) series.thumbnail = thumbnail || '';
    if (Array.isArray(tags)) series.tags = tags.filter((t) => typeof t === 'string' && t.trim());
    if (status !== undefined) series.status = status;

    await series.save();
    return sendSuccess(res, series);
  } catch (err) {
    return next(err);
  }
};

const deleteSeries = async (req, res, next) => {
  try {
    const ownerId = req.user && req.user.id;
    const { seriesId } = req.params;

    if (!Types.ObjectId.isValid(seriesId)) {
      return next({ status: 400, message: 'Invalid seriesId' });
    }

    const series = await Series.findById(seriesId);
    if (!series) {
      return next({ status: 404, message: 'Series not found' });
    }
    if (!ensureOwnerOrAdmin(series.creator, req.user)) {
      return next({ status: 403, message: 'You do not have access to this series' });
    }

    const hasEpisodes = await Episode.exists({ series: seriesId });
    if (hasEpisodes) {
      return next({ status: 400, message: 'Series has episodes; delete them first' });
    }

    await series.deleteOne();
    return sendSuccess(res, { deleted: true });
  } catch (err) {
    return next(err);
  }
};

const updateEpisode = async (req, res, next) => {
  try {
    const ownerId = req.user && req.user.id;
    const { seriesId, episodeId } = req.params;
    const { title, synopsis, order, releaseDate, video, thumbnail } = req.body || {};

    if (!Types.ObjectId.isValid(seriesId) || !Types.ObjectId.isValid(episodeId)) {
      return next({ status: 400, message: 'Invalid id' });
    }

    const series = await Series.findById(seriesId);
    if (!series) {
      return next({ status: 404, message: 'Series not found' });
    }
    if (req.user.role !== 'admin' && series.creator.toString() !== ownerId) {
      return next({ status: 403, message: 'You do not have access to this series' });
    }

    const episode = await Episode.findById(episodeId);
    if (!episode || episode.series.toString() !== seriesId) {
      return next({ status: 404, message: 'Episode not found' });
    }

    if (title !== undefined) {
      if (!title || typeof title !== 'string' || !title.trim()) {
        return next({ status: 400, message: 'Title is required' });
      }
      episode.title = title.trim();
    }
    if (synopsis !== undefined) episode.synopsis = synopsis || '';
    if (thumbnail !== undefined) episode.thumbnail = thumbnail || '';
    if (thumbnail !== undefined) episode.thumbnail = thumbnail || '';
    if (order !== undefined) {
      if (!Number.isInteger(order) || order < 1) {
        return next({ status: 400, message: 'order must be a positive integer' });
      }
      episode.order = order;
    }
    if (releaseDate !== undefined) {
      const parsed = releaseDate ? new Date(releaseDate) : null;
      if (parsed && Number.isNaN(parsed.getTime())) {
        return next({ status: 400, message: 'releaseDate is invalid' });
      }
      episode.releaseDate = parsed || undefined;
    }
    if (video !== undefined) {
      if (video && !Types.ObjectId.isValid(video)) {
        return next({ status: 400, message: 'Invalid video id' });
      }
      if (video) {
        const videoDoc = await Video.findById(video);
        if (!videoDoc) return next({ status: 404, message: 'Video not found' });
        if (req.user.role !== 'admin' && videoDoc.owner.toString() !== ownerId) {
          return next({ status: 403, message: 'You do not have access to this video' });
        }
      }
      episode.video = video || undefined;
    }

    await episode.save();
    return sendSuccess(res, episode);
  } catch (err) {
    return next(err);
  }
};

const deleteEpisode = async (req, res, next) => {
  try {
    const ownerId = req.user && req.user.id;
    const { seriesId, episodeId } = req.params;

    if (!Types.ObjectId.isValid(seriesId) || !Types.ObjectId.isValid(episodeId)) {
      return next({ status: 400, message: 'Invalid id' });
    }

    const series = await Series.findById(seriesId);
    if (!series) {
      return next({ status: 404, message: 'Series not found' });
    }
    if (req.user.role !== 'admin' && series.creator.toString() !== ownerId) {
      return next({ status: 403, message: 'You do not have access to this series' });
    }

    const episode = await Episode.findById(episodeId);
    if (!episode || episode.series.toString() !== seriesId) {
      return next({ status: 404, message: 'Episode not found' });
    }

    await episode.deleteOne();
    return sendSuccess(res, { deleted: true });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createSeries,
  listSeries,
  updateSeries,
  deleteSeries,
  createEpisode,
  listEpisodes,
  updateEpisode,
  deleteEpisode,
  createVideo,
  updateVideoStatus,
  listVideos,
  deleteVideo
};
