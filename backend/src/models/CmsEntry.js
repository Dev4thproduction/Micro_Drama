const mongoose = require('mongoose');

const cmsStatuses = ['draft', 'review', 'scheduled', 'published', 'archived'];
const cmsTypes = ['page', 'collection', 'announcement', 'banner'];
const visibilityOptions = ['public', 'authenticated', 'subscribers', 'internal'];

const CmsEntrySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
    type: { type: String, enum: cmsTypes, default: 'page' },
    summary: { type: String, default: '' },
    body: { type: String, default: '' },
    tags: [{ type: String, trim: true }],
    heroImage: { type: String, default: '' },
    status: { type: String, enum: cmsStatuses, default: 'draft' },
    visibility: { type: String, enum: visibilityOptions, default: 'public' },
    publishAt: { type: Date },
    publishedAt: { type: Date },
    archivedAt: { type: Date },
    version: { type: Number, default: 1, min: 1 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seo: {
      title: { type: String, trim: true },
      description: { type: String, trim: true },
      keywords: [{ type: String, trim: true }]
    },
    blocks: [{ type: Object }]
  },
  { timestamps: true }
);

CmsEntrySchema.index({ slug: 1 }, { unique: true });
CmsEntrySchema.index({ status: 1, publishAt: 1 });
CmsEntrySchema.index({ type: 1, visibility: 1 });

module.exports = mongoose.model('CmsEntry', CmsEntrySchema);

