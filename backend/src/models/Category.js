const mongoose = require('mongoose');

const slugify = (name) =>
    name
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const CategorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, unique: true },
        slug: { type: String, required: true, trim: true, unique: true },
        description: { type: String, default: '' },
        color: { type: String, default: '#3B82F6' }, // Default blue color
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    { timestamps: true }
);

// Auto-generate slug before validation
CategorySchema.pre('validate', function (next) {
    if (this.name && !this.slug) {
        this.slug = slugify(this.name);
    }
    next();
});

CategorySchema.index({ slug: 1 });

module.exports = mongoose.model('Category', CategorySchema);
