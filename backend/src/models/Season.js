const mongoose = require('mongoose');

const seasonSchema = new mongoose.Schema(
    {
        series: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Series',
            required: true,
            index: true
        },
        number: {
            type: Number,
            required: true,
            min: 1
        },
        title: {
            type: String,
            default: ''
        },
        description: {
            type: String,
            default: ''
        },
        status: {
            type: String,
            enum: ['draft', 'published', 'archived'],
            default: 'draft'
        },
        posterUrl: {
            type: String,
            default: ''
        },
        releaseDate: Date
    },
    { timestamps: true }
);

// Compound unique index: one season number per series
seasonSchema.index({ series: 1, number: 1 }, { unique: true });

module.exports = mongoose.model('Season', seasonSchema);
