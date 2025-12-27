const mongoose = require('mongoose');

const WatchHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    episode: { type: mongoose.Schema.Types.ObjectId, ref: 'Episode', required: true },
    progressSeconds: { type: Number, default: 0, min: 0 },
    completed: { type: Boolean, default: false },
    lastWatchedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

WatchHistorySchema.index({ user: 1, episode: 1 }, { unique: true });
WatchHistorySchema.index({ user: 1, lastWatchedAt: -1 });

module.exports = mongoose.model('WatchHistory', WatchHistorySchema);
