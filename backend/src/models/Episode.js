const mongoose = require('mongoose');

const episodeStatuses = ['pending', 'draft', 'scheduled', 'published', 'archived'];

const EpisodeSchema = new mongoose.Schema(
  {
    series: { type: mongoose.Schema.Types.ObjectId, ref: 'Series', required: true },
    title: { type: String, required: true, trim: true },
    synopsis: { type: String, default: '' },
    thumbnail: { type: String, trim: true },
    order: { type: Number, required: true, min: 1 },
    releaseDate: { type: Date },
    status: { type: String, enum: episodeStatuses, default: 'pending' },
    video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
    approvedAt: { type: Date },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvalNote: { type: String, trim: true }
  },
  { timestamps: true }
);

EpisodeSchema.index({ series: 1, order: 1 }, { unique: true });
EpisodeSchema.index({ status: 1, releaseDate: 1 });

module.exports = mongoose.model('Episode', EpisodeSchema);
