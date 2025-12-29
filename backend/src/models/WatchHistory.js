const mongoose = require('mongoose');

const WatchHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  series: { type: mongoose.Schema.Types.ObjectId, ref: 'Series', required: true },
  episode: { type: mongoose.Schema.Types.ObjectId, ref: 'Episode', required: true },
  progress: { type: Number, default: 0 }, // Seconds watched
  duration: { type: Number, default: 0 }, // Total duration
  lastWatched: { type: Date, default: Date.now },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

// Compound index for efficient lookups
WatchHistorySchema.index({ user: 1, lastWatched: -1 });
WatchHistorySchema.index({ user: 1, series: 1 });

module.exports = mongoose.model('WatchHistory', WatchHistorySchema);
