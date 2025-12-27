const { Types } = require('mongoose');
const Series = require('../models/Series');
const Episode = require('../models/Episode');
const { sendSuccess } = require('../utils/response');
const { parsePagination, buildMeta } = require('../utils/pagination');

const listPublishedSeries = async (req, res, next) => {
  try {
    const { limit, skip, sort, page } = parsePagination(req.query, {
      allowedSortFields: ['createdAt', 'title'],
      defaultSort: { createdAt: -1 }
    });
    const filter = { status: 'published' };
    const [series, total] = await Promise.all([
      Series.find(filter)
        .sort(sort)
        .skip(skip || 0)
        .limit(limit || 0),
      Series.countDocuments(filter)
    ]);
    return sendSuccess(res, series, buildMeta(total, page, limit));
  } catch (err) {
    return next(err);
  }
};

const listPublishedEpisodes = async (req, res, next) => {
  try {
    const { seriesId } = req.params;
    if (!Types.ObjectId.isValid(seriesId)) {
      return next({ status: 400, message: 'Invalid seriesId' });
    }

    const series = await Series.findById(seriesId).select('_id');
    if (!series) {
      return next({ status: 404, message: 'Series not found' });
    }

    const { limit, skip, sort, page } = parsePagination(req.query, {
      allowedSortFields: ['createdAt', 'releaseDate', 'order'],
      defaultSort: { order: 1 }
    });

    const filter = { series: seriesId, status: 'published' };
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

const getEpisodeDetails = async (req, res, next) => {
  try {
    const { episodeId } = req.params;
    if (!Types.ObjectId.isValid(episodeId)) {
      return next({ status: 400, message: 'Invalid episodeId' });
    }

    const episode = await Episode.findOne({ _id: episodeId, status: 'published' });
    if (!episode) {
      return next({ status: 404, message: 'Episode not found' });
    }

    return sendSuccess(res, episode);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  listPublishedSeries,
  listPublishedEpisodes,
  getEpisodeDetails
};
