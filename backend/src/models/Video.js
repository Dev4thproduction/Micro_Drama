const mongoose = require('mongoose');

const videoStatuses = ['pending', 'uploading', 'processing', 'ready', 'failed'];

const VideoSchema = new mongoose.Schema(
  {
    s3Key: { type: String, required: true, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    storageUrl: { type: String, required: true, trim: true },
    status: { type: String, enum: videoStatuses, default: 'pending' },
    durationSeconds: { type: Number, default: 0, min: 0 },
    sizeBytes: { type: Number, default: 0, min: 0 },
    format: { type: String, trim: true },
    resolution: { type: String, trim: true }
  },
  { timestamps: true }
);

VideoSchema.index({ owner: 1 });
VideoSchema.index({ status: 1 });

module.exports = mongoose.model('Video', VideoSchema);
