const Episode = require('../models/Episode');
const Series = require('../models/Series');
const { sendSuccess } = require('../utils/response');

const getFeed = async (req, res, next) => {
    try {
        // Basic algorithm: Get random published episodes
        // In production, this would be a sophisticated recommendation engine
        const limit = parseInt(req.query.limit) || 10;

        // Aggregate to get random sample of published episodes
        const feed = await Episode.aggregate([
            { $match: { status: 'published' } },
            { $sample: { size: limit } },
            {
                $lookup: {
                    from: 'series',
                    localField: 'series',
                    foreignField: '_id',
                    as: 'series'
                }
            },
            { $unwind: '$series' },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    synopsis: 1,
                    order: 1,
                    videoUrl: 1,
                    thumbnailUrl: 1,
                    duration: 1,
                    isFree: 1,
                    createdAt: 1,
                    'series._id': 1,
                    'series.title': 1,
                    'series.posterUrl': 1
                }
            }
        ]);

        return sendSuccess(res, feed);
    } catch (err) {
        return next(err);
    }
};

module.exports = { getFeed };
