const { Types } = require('mongoose');
const Series = require('../models/Series');
const Episode = require('../models/Episode');
const Video = require('../models/Video');
const { sendSuccess } = require('../utils/response');
const { parsePagination, buildMeta } = require('../utils/pagination');

const createSeries = async (req, res, next) => {
  try {
    const { title, description, tags } = req.body || {};
    const creatorId = req.user && req.user.id;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return next({ status: 400, message: 'Title is required' });
    }

    const safeTags = Array.isArray(tags) ? tags.filter((t) => typeof t === 'string') : [];

    const series = await Series.create({
      title: title.trim(),
      description: description || '',
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
    const { title, synopsis, order, releaseDate, video } = req.body || {};

    if (!Types.ObjectId.isValid(seriesId)) {
      return next({ status: 400, message: 'Invalid seriesId' });
    }
    if (!title || typeof title !== 'string' || !title.trim()) {
      return next({ status: 400, message: 'Title and order are required' });
    }
    if (order === undefined || !Number.isInteger(order) || order < 1) {
      return next({ status: 400, message: 'order must be a positive integer' });
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
    if (series.creator.toString() !== creatorId) {
      return next({ status: 403, message: 'You do not have access to this series' });
    }

    let videoDoc;
    if (video) {
      videoDoc = await Video.findById(video);
      if (!videoDoc) {
        return next({ status: 404, message: 'Video not found' });
      }
      if (videoDoc.owner.toString() !== creatorId) {
        return next({ status: 403, message: 'You do not have access to this video' });
      }
    }

    const episode = await Episode.create({
      series: seriesId,
      title: title.trim(),
      synopsis: synopsis || '',
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
    if (series.creator.toString() !== creatorId) {
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

module.exports = {
  createSeries,
  listSeries,
  createEpisode,
  listEpisodes,
  createVideo,
  listVideos
};
