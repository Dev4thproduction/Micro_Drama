const { Types } = require('mongoose');
const Series = require('../models/Series');
const Episode = require('../models/Episode');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { sendSuccess } = require('../utils/response');
const { parsePagination, buildMeta } = require('../utils/pagination');

const listPendingSeries = async (req, res, next) => {
  try {
    const { limit, skip, sort, page } = parsePagination(req.query, {
      allowedSortFields: ['createdAt', 'title'],
      defaultSort: { createdAt: -1 }
    });
    const filter = { status: 'pending' };
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

const listPendingEpisodes = async (req, res, next) => {
  try {
    const { limit, skip, sort, page } = parsePagination(req.query, {
      allowedSortFields: ['createdAt', 'releaseDate', 'order'],
      defaultSort: { createdAt: -1 }
    });
    const filter = { status: 'pending' };
    const [items, total] = await Promise.all([
      Episode.find(filter)
        .sort(sort)
        .skip(skip || 0)
        .limit(limit || 0),
      Episode.countDocuments(filter)
    ]);
    return sendSuccess(res, items, buildMeta(total, page, limit));
  } catch (err) {
    return next(err);
  }
};

const approveEpisode = async (req, res, next) => {
  try {
    const { episodeId } = req.params;
    const { note } = req.body || {};
    if (!Types.ObjectId.isValid(episodeId)) {
      return next({ status: 400, message: 'Invalid episodeId' });
    }
    const episode = await Episode.findById(episodeId);
    if (!episode) {
      return next({ status: 404, message: 'Episode not found' });
    }

    if (episode.status !== 'pending') {
      return next({ status: 400, message: 'Episode is not pending' });
    }

    episode.status = 'published';
    episode.approvedAt = new Date();
    episode.approvedBy = req.user && req.user.id;
    episode.approvalNote = typeof note === 'string' ? note.trim() : undefined;
    await episode.save();

    const series = await Series.findById(episode.series);
    if (series && (series.status === 'pending' || series.status === 'draft')) {
      series.status = 'published';
      await series.save();
    }

    return sendSuccess(res, episode);
  } catch (err) {
    return next(err);
  }
};

const toggleSubscription = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isSubscribed } = req.body || {};

    if (typeof isSubscribed !== 'boolean') {
      return next({ status: 400, message: 'isSubscribed boolean is required' });
    }

    if (!Types.ObjectId.isValid(userId)) {
      return next({ status: 400, message: 'Invalid userId' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return next({ status: 404, message: 'User not found' });
    }

    let subscription = await Subscription.findOne({ user: userId });
    if (!subscription) {
      subscription = new Subscription({
        user: userId,
        plan: 'basic',
        status: 'trial'
      });
    }

    if (isSubscribed) {
      subscription.status = 'active';
      subscription.startDate = new Date();
      subscription.endDate = null;
      subscription.renewsAt = null;
    } else {
      subscription.status = 'canceled';
      subscription.renewsAt = null;
    }

    await subscription.save();

    return sendSuccess(res, {
      userId,
      isSubscribed,
      subscriptionStatus: subscription.status
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  listPendingSeries,
  listPendingEpisodes,
  approveEpisode,
  toggleSubscription
};
