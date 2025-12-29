const Series = require('../models/Series');
const Episode = require('../models/Episode');
const { sendSuccess } = require('../utils/response');

const Category = require('../models/Category');
const WatchHistory = require('../models/WatchHistory');

const getHome = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const guestId = req.headers['x-guest-id'];
        const { category } = req.query; // Get category slug from query

        // Resolve Category ID if filtering
        let categoryId = null;
        if (category && category !== 'all' && category !== 'trending') {
            const catDoc = await Category.findOne({ slug: category });
            if (catDoc) categoryId = catDoc._id;
        }

        // 1. Continue Watching (User OR Guest)
        let continueWatching = [];
        if (userId || guestId) {
            const query = userId ? { user: userId } : { guestId };

            continueWatching = await WatchHistory.find(query)
                .sort({ lastWatched: -1 })
                .limit(20) // Fetch more to allow for filtering
                .populate('series', 'title posterUrl category')
                .populate('episode', 'title order thumbnailUrl duration');

            // Filter: Only show uncompleted AND match category if active
            continueWatching = continueWatching.filter(h => {
                if (!h.series || !h.episode || h.completed) return false;
                if (categoryId && h.series.category && h.series.category.toString() !== categoryId.toString()) return false;
                return true;
            });

            if (continueWatching.length > 5) continueWatching = continueWatching.slice(0, 5);
        }

        // 1.5 Because You Watched (Recommendation) - Skip if filtering by genre (or keep? Let's keep if it matches)
        let becauseYouWatched = null;
        // Only generate recommendation if NOT filtering, or if we want to be smart. 
        // Simplicity: Keep it only on main 'All' view to avoid confusion.
        if (!category || category === 'all') {
            if (userId || guestId) {
                const query = userId ? { user: userId } : { guestId };
                const lastWatched = await WatchHistory.findOne(query)
                    .sort({ lastWatched: -1 })
                    .populate('series', 'category title');

                if (lastWatched && lastWatched.series && lastWatched.series.category) {
                    const recommendations = await Series.find({
                        category: lastWatched.series.category,
                        _id: { $ne: lastWatched.series._id }
                    })
                        .sort({ views: -1 })
                        .limit(6)
                        .select('title posterUrl category rating seasonCount views');

                    if (recommendations.length > 0) {
                        becauseYouWatched = {
                            sourceSeriesTitle: lastWatched.series.title,
                            items: recommendations
                        };
                    }
                }
            }
        }

        // 2. Featured Series (Smart - Only fetch if NO category filter or if we want to preserve banner, but typically client preserves banner)
        // User Rule: "Banner content does NOT change on category click". 
        // So we can skip fetching it here if client sends a flag, BUT client just calls API. 
        // Let's just return it, and client can choose to ignore/overwrite.
        // Or simpler: Always return it, doesn't hurt.
        let featured = [];
        if (userId || guestId) {
            const query = userId ? { user: userId } : { guestId };
            const lastInteracted = await WatchHistory.findOne(query)
                .sort({ lastWatched: -1 })
                .populate('series');
            if (lastInteracted && lastInteracted.series) featured = [lastInteracted.series];
        }
        if (featured.length === 0) {
            featured = await Series.aggregate([{ $match: { status: 'published' } }, { $sample: { size: 1 } }]);
        }
        // NOTE: We do NOT filter featured by category because "Banner content does NOT change".

        // 3. Trending (Sorted by Views)
        let trendingQuery = {};
        if (categoryId) trendingQuery.category = categoryId;

        const trending = await Series.find(trendingQuery)
            .sort({ views: -1 })
            .limit(6)
            .populate('category', 'name color')
            .select('title posterUrl category rating seasonCount views');

        // 4. New Episodes (Latest Published)
        // If filtering by category, we need to find Series in that category first, OR aggregation.
        let newEpisodesQuery = {};
        if (categoryId) {
            // Find series IDs in this category
            const seriesInCat = await Series.find({ category: categoryId }).select('_id');
            const seriesIds = seriesInCat.map(s => s._id);
            newEpisodesQuery.series = { $in: seriesIds };
        }

        const newEpisodes = await Episode.find(newEpisodesQuery)
            .sort({ createdAt: -1 })
            .limit(8)
            .populate('series', 'title posterUrl')
            .select('title thumbnailUrl order duration createdAt series');

        // 5. Genres (Always return all for the pills)
        const categories = await Category.find({})
            .select('name slug color')
            .sort({ name: 1 });

        // 6. Featured Progress (For Smart Hero CTA)
        let featuredProgress = null;
        if (featured[0] && (userId || guestId)) {
            const query = userId ? { user: userId } : { guestId };
            // Find most recent watched episode for this series
            const history = await WatchHistory.findOne({ ...query, series: featured[0]._id })
                .sort({ lastWatched: -1 })
                .populate('episode', 'order title'); // Get episode details

            if (history) {
                // If found, return progress details
                featuredProgress = {
                    episodeId: history.episode._id,
                    episodeOrder: history.episode.order,
                    progressSeconds: history.progress,
                    duration: history.duration,
                    completed: history.completed
                };
            }
        }

        return sendSuccess(res, {
            featured: featured[0] || null,
            featuredProgress,
            continueWatching,
            becauseYouWatched,
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
        const { search, category, sort, ids } = req.query;
        let query = {}; // Show ALL statuses

        if (ids) {
            const idList = ids.split(',').filter(id => id.match(/^[0-9a-fA-F]{24}$/));
            if (idList.length > 0) {
                query._id = { $in: idList };
            }
        }

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

const getSeriesDetails = async (req, res, next) => {
    try {
        const { seriesId } = req.params;

        // Validate Series exists & Populate
        const series = await Series.findById(seriesId)
            .populate('category', 'name color slug')
            .populate('creator', 'displayName')
            .select('title posterUrl description status views tags createdAt category creator seasonCount');

        if (!series) {
            return next({ status: 404, message: 'Series not found' });
        }

        // Get Episodes sorted by order
        const episodes = await Episode.find({
            series: seriesId,
            status: 'published'
        })
            .sort({ order: 1 })
            .select('title synopsis order videoUrl thumbnailUrl duration isFree views');

        // Fetch Progress if user/guest
        const userId = req.user?.id;
        const guestId = req.headers['x-guest-id'];
        let episodesWithProgress = episodes.map(ep => ep.toObject());
        let userProgress = {
            totalEpisodes: episodes.length,
            watchedEpisodes: 0,
            lastWatchedEpisodeId: null,
            completed: false
        };

        if (userId || guestId) {
            const query = userId ? { user: userId } : { guestId };
            const historyParams = { ...query, series: seriesId };
            const historyDocs = await WatchHistory.find(historyParams).limit(1000); // safety limit

            // Create a map for fast lookup
            const historyMap = {};
            let lastWatchedDate = 0;

            historyDocs.forEach(h => {
                historyMap[h.episode.toString()] = h;
                if (h.completed) userProgress.watchedEpisodes++;
                if (new Date(h.lastWatched).getTime() > lastWatchedDate) {
                    lastWatchedDate = new Date(h.lastWatched).getTime();
                    userProgress.lastWatchedEpisodeId = h.episode;
                }
            });

            episodesWithProgress = episodesWithProgress.map(ep => {
                const h = historyMap[ep._id.toString()];
                return {
                    ...ep,
                    progress: h ? h.progress : 0,
                    completed: h ? h.completed : false
                };
            });

            userProgress.completed = userProgress.watchedEpisodes >= userProgress.totalEpisodes;
        }

        return sendSuccess(res, {
            series,
            episodes: episodesWithProgress,
            userProgress
        });
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

        // Fetch Progress if user/guest
        const userId = req.user?.id;
        const guestId = req.headers['x-guest-id'];
        let episodesWithProgress = episodes.map(ep => ep.toObject());

        if (userId || guestId) {
            const query = userId ? { user: userId } : { guestId };
            const historyParams = { ...query, series: seriesId };
            const historyDocs = await WatchHistory.find(historyParams);

            // Create a map for fast lookup
            const historyMap = {};
            historyDocs.forEach(h => {
                historyMap[h.episode.toString()] = h;
            });

            episodesWithProgress = episodesWithProgress.map(ep => {
                const h = historyMap[ep._id.toString()];
                return {
                    ...ep,
                    progress: h ? h.progress : 0,
                    completed: h ? h.completed : false
                };
            });
        }

        return sendSuccess(res, {
            series,
            episodes: episodesWithProgress
        });
    } catch (err) {
        return next(err);
    }
};

const getFollowingUpdates = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const guestId = req.headers['x-guest-id'];
        const { seriesIds } = req.body;

        if (!seriesIds || !Array.isArray(seriesIds) || seriesIds.length === 0) {
            return sendSuccess(res, []);
        }

        // 1. Fetch Series Basic Info
        const seriesList = await Series.find({
            _id: { $in: seriesIds },
            status: 'published'
        }).select('title posterUrl category');

        const updates = [];

        // 2. For each series, check latest episode and watch status
        for (const series of seriesList) {
            const latestEpisode = await Episode.findOne({
                series: series._id,
                status: 'published'
            })
                .sort({ order: -1 }) // Assuming order correlates with release, or use createdAt/releaseDate
                .select('title order thumbnailUrl createdAt releaseDate');

            if (!latestEpisode) continue;

            let isWatched = false;
            if (userId || guestId) {
                const query = userId ? { user: userId } : { guestId };
                const history = await WatchHistory.findOne({
                    ...query,
                    episode: latestEpisode._id,
                    completed: true
                });
                if (history) isWatched = true;
            }

            if (!isWatched) {
                updates.push({
                    series,
                    latestEpisode,
                    isNew: true // Flag for frontend
                });
            }
        }

        // Sort by latest release date
        updates.sort((a, b) => new Date(b.latestEpisode.createdAt) - new Date(a.latestEpisode.createdAt));

        return sendSuccess(res, updates);
    } catch (err) {
        return next(err);
    }
};

module.exports = { getHome, getSeriesEpisodes, getDiscover, getSeriesDetails, getFollowingUpdates };
