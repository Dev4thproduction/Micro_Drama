const Video = require('../models/Video');
const Episode = require('../models/Episode');
const { sendSuccess } = require('../utils/response');

// Simulated processing webhook.
// Expect body: { s3Key: string, status: 'processing' | 'ready' | 'failed', durationSeconds?, note? }
const handleProcessingWebhook = async (req, res, next) => {
  try {
    const { s3Key, status, durationSeconds, note } = req.body || {};
    const allowed = ['processing', 'ready', 'failed'];
    if (!s3Key || !status || !allowed.includes(status)) {
      return next({ status: 400, message: 's3Key and valid status are required' });
    }

    const video = await Video.findOne({ s3Key });
    if (!video) {
      return next({ status: 404, message: 'Video not found' });
    }

    video.status = status;
    if (durationSeconds !== undefined) {
      video.durationSeconds = durationSeconds;
    }
    video.processingNote = typeof note === 'string' ? note.trim() : undefined;
    await video.save();

    // If video is attached to an episode and becomes ready, auto-set episode to pending (if draft) for approval.
    if (status === 'ready') {
      await Episode.updateMany(
        { video: video._id, status: { $in: ['draft', 'pending'] } },
        { $set: { status: 'pending' } }
      );
    }

    return sendSuccess(res, { updated: true });
  } catch (err) {
    return next(err);
  }
};

module.exports = { handleProcessingWebhook };
