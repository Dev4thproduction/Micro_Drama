const mongoose = require('mongoose');

const episodeStatuses = ['pending', 'draft', 'scheduled', 'published', 'archived'];

const EpisodeSchema = new mongoose.Schema(
  {
    series: { type: mongoose.Schema.Types.ObjectId, ref: 'Series', required: true },
    season: { type: mongoose.Schema.Types.ObjectId, ref: 'Season' },
    title: { type: String, required: true, trim: true },
    synopsis: { type: String, default: '' },
    order: { type: Number, required: true, min: 1 },
    releaseDate: { type: Date },
    status: { type: String, enum: episodeStatuses, default: 'pending' },
    isFree: { type: Boolean, default: false }, // Free or Paid episode
    video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
    // Cloudinary video fields
    videoUrl: { type: String, default: '' },
    videoPublicId: { type: String, default: '' },
    thumbnailUrl: { type: String, default: '' },
    duration: { type: Number, default: 0 } // in seconds
  },
  { timestamps: true }
);

EpisodeSchema.index({ series: 1, order: 1 }, { unique: true });
EpisodeSchema.index({ season: 1 });
EpisodeSchema.index({ status: 1, releaseDate: 1 });
EpisodeSchema.index({ isFree: 1 });

module.exports = mongoose.model('Episode', EpisodeSchema);
