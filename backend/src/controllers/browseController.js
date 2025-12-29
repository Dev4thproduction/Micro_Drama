const Series = require('../models/Series');
const Episode = require('../models/Episode');
const { sendSuccess } = require('../utils/response');

const Category = require('../models/Category');
const WatchHistory = require('../models/WatchHistory');

const getHome = async (req, res, next) => {
    try {
        const userId = req.user?.id;

        // 1. Continue Watching (If User Logged In)
        let continueWatching = [];
        if (userId) {
            continueWatching = await WatchHistory.find({ user: userId })
                .sort({ lastWatched: -1 })
                .limit(5)
                .populate('series', 'title posterUrl')
                .populate('episode', 'title order thumbnailUrl duration');
        }

        // 2. Featured Series (Random 1 for Hero Banner)
        const featured = await Series.aggregate([
            { $match: {} }, // Show ALL statuses for debugging
            { $sample: { size: 1 } }
        ]);

        // 3. Trending (Sorted by Views)
        const trending = await Series.find({}) // Show ALL statuses
            .sort({ views: -1 })
            .limit(6)
            .populate('category', 'name color')
            .select('title posterUrl category rating seasonCount views');

        // 4. New Episodes (Latest Published Episodes)
        const newEpisodes = await Episode.find({}) // Show ALL statuses
            .sort({ createdAt: -1 })
            .limit(8)
            .populate('series', 'title posterUrl')
            .select('title thumbnailUrl order duration createdAt series');

        // 5. Genres
        const categories = await Category.find({})
            .select('name slug color')
            .sort({ name: 1 });

        return sendSuccess(res, {
            featured: featured[0] || null,
            continueWatching,
            trending,
            newEpisodes,
            categories
        });
    } catch (err) {
        return next(err);
    }
};

const getDiscover = async (req, res, next) => {
    try {
        const { search, category, sort } = req.query;
        let query = {}; // Show ALL statuses

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        if (category && category !== 'all') {
            const catDoc = await Category.findOne({ slug: category });
            if (catDoc) {
                query.category = catDoc._id;
            }
        }

        let sortOption = { createdAt: -1 }; // Default new
        if (sort === 'popular') {
            sortOption = { views: -1 };
        }

        const results = await Series.find(query)
            .sort(sortOption)
            .populate('category', 'name color')
            .select('title posterUrl category views seasonCount');

        return sendSuccess(res, results);
    } catch (err) {
        return next(err);
    }
};

const getSeriesEpisodes = async (req, res, next) => {
    try {
        const { seriesId } = req.params;

        // Validate Series exists
        const series = await Series.findById(seriesId).select('title posterUrl description');
        if (!series) {
            return next({ status: 404, message: 'Series not found' });
        }

        // Get Episodes sorted by order
        const episodes = await Episode.find({
            series: seriesId,
            status: 'published'
        })
            .sort({ order: 1 })
            .select('title synopsis order videoUrl thumbnailUrl duration isFree');

        return sendSuccess(res, {
            series,
            episodes
        });
    } catch (err) {
        return next(err);
    }
};

module.exports = { getHome, getSeriesEpisodes, getDiscover };
