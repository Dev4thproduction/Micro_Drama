const mongoose = require('mongoose');

const CmsAuditLogSchema = new mongoose.Schema(
  {
    entry: { type: mongoose.Schema.Types.ObjectId, ref: 'CmsEntry', required: true },
    action: { type: String, required: true, trim: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    metadata: { type: Object }
  },
  { timestamps: true }
);

CmsAuditLogSchema.index({ entry: 1, createdAt: -1 });

module.exports = mongoose.model('CmsAuditLog', CmsAuditLogSchema);

