const mongoose = require('mongoose');

const seriesStatuses = ['pending', 'draft', 'published', 'archived'];

const SeriesSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    thumbnail: { type: String, trim: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: seriesStatuses, default: 'pending' },
    tags: [{ type: String, trim: true }]
  },
  { timestamps: true }
);

SeriesSchema.index({ creator: 1 });
SeriesSchema.index({ status: 1 });

module.exports = mongoose.model('Series', SeriesSchema);
