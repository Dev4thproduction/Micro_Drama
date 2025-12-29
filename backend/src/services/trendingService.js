const WatchHistory = require('../models/WatchHistory');
const Series = require('../models/Series');

// Simple in-memory cache
const cache = {
    data: {},
    ttl: 300000 // 5 minutes ms
};

class TrendingService {

    /**
     * Get Trending Series based on recent completions
     * @param {string|null} categoryId - Optional category filter
     * @param {number} limit - Number of results
     * @returns {Promise<Array>}
     */
    async getTrendingSeries(categoryId = null, limit = 10) {
        const cacheKey = `trending_${categoryId || 'all'}_${limit}`;
        const now = Date.now();

        // Check Cache
        if (cache.data[cacheKey] && cache.data[cacheKey].expiry > now) {
            return cache.data[cacheKey].results;
        }

        // 1. Define Time Window (e.g., Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // 2. Build Aggregation Pipeline
        const pipeline = [
            // Filter: Recent activity & Completed episodes
            {
                $match: {
                    lastWatched: { $gte: sevenDaysAgo },
                    completed: true
                }
            },
            // Group by Series to count completions
            {
                $group: {
                    _id: '$series',
                    score: { $sum: 1 } // 1 point per completion
                }
            },
            // Sort by Score
            { $sort: { score: -1 } },
            // Limit (fetch a bit more to filter unpublished/category later if needed)
            { $limit: limit * 2 }
        ];

        // Execute Aggregation
        const aggregates = await WatchHistory.aggregate(pipeline);

        // 3. Populate Series Details & Apply Filters
        const seriesIds = aggregates.map(a => a._id);

        const query = {
            _id: { $in: seriesIds },
            status: 'published' // Ensure only published content
        };

        if (categoryId) {
            query.category = categoryId;
        }

        const seriesDocs = await Series.find(query)
            .select('title posterUrl category rating seasonCount views')
            .populate('category', 'name color');

        // 4. Map Scores back to Series and Sort Final
        let results = seriesDocs.map(doc => {
            const agg = aggregates.find(a => a._id.toString() === doc._id.toString());
            return {
                ...doc.toObject(),
                trendingScore: agg ? agg.score : 0
            };
        });

        // Sort by trending score desc
        results.sort((a, b) => b.trendingScore - a.trendingScore);

        // Limit final output
        results = results.slice(0, limit);

        // Update Cache
        cache.data[cacheKey] = {
            results,
            expiry: now + cache.ttl
        };

        return results;
    }
}

module.exports = new TrendingService();
