const { Types } = require('mongoose');
const Episode = require('../models/Episode');
const Video = require('../models/Video');
const WatchHistory = require('../models/WatchHistory');
const Subscription = require('../models/Subscription');
const { createPresignedGetUrl } = require('../utils/s3');
const { sendSuccess } = require('../utils/response');

const getPlaybackUrl = async (req, res, next) => {
  try {
    const { episodeId } = req.params;
    const userId = req.user && req.user.id;

    if (!Types.ObjectId.isValid(episodeId)) {
      return next({ status: 400, message: 'Invalid episodeId' });
    }

    const episode = await Episode.findById(episodeId).select('status video');
    if (!episode) {
      return next({ status: 404, message: 'Episode not found' });
    }

    if (episode.status !== 'published') {
      return next({ status: 403, message: 'Episode is not published' });
    }

    if (!episode.video) {
      return next({ status: 404, message: 'Video not found for this episode' });
    }

    const video = await Video.findById(episode.video).select('s3Key status');
    if (!video) {
      return next({ status: 404, message: 'Video not found' });
    }

    if (!video.s3Key) {
      return next({ status: 500, message: 'Video key missing' });
    }

    const subscription = await Subscription.findOne({ user: userId }).select('status');
    const allowedStatuses = ['active', 'trial'];
    if (!subscription || !allowedStatuses.includes(subscription.status)) {
      return next({ status: 403, message: 'Active subscription required for playback' });
    }

    const playUrl = await createPresignedGetUrl({
      key: video.s3Key,
      expiresInSeconds: 300
    });

    return sendSuccess(res, { playUrl });
  } catch (err) {
    return next(err);
  }
};

const saveProgress = async (req, res, next) => {
  try {
    const userId = req.user && req.user.id;
    const { episodeId, progressSeconds, completed } = req.body || {};

    if (!episodeId || progressSeconds === undefined) {
      return next({ status: 400, message: 'episodeId and progressSeconds are required' });
    }
    if (!Types.ObjectId.isValid(episodeId)) {
      return next({ status: 400, message: 'Invalid episodeId' });
    }

    if (typeof progressSeconds !== 'number' || progressSeconds < 0) {
      return next({ status: 400, message: 'progressSeconds must be a non-negative number' });
    }

    const episode = await Episode.findById(episodeId).select('_id');
    if (!episode) {
      return next({ status: 404, message: 'Episode not found' });
    }

    const history = await WatchHistory.findOneAndUpdate(
      { user: userId, episode: episodeId },
      {
        progressSeconds,
        completed: typeof completed === 'boolean' ? completed : false,
        lastWatchedAt: new Date()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return sendSuccess(res, history);
  } catch (err) {
    return next(err);
  }
};

module.exports = { getPlaybackUrl, saveProgress };
