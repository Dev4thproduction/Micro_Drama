const trendingService = require('../services/trendingService');
const Category = require('../models/Category');
const { sendSuccess } = require('../utils/response');

const getTrending = async (req, res, next) => {
    try {
        const { category, limit } = req.query;

        let categoryId = null;
        if (category && category !== 'all') {
            const catDoc = await Category.findOne({ slug: category });
            if (catDoc) {
                categoryId = catDoc._id;
            }
        }

        const numLimit = parseInt(limit) || 10;

        const results = await trendingService.getTrendingSeries(categoryId, numLimit);

        return sendSuccess(res, results);
    } catch (err) {
        return next(err);
    }
};

module.exports = {
    getTrending
};
