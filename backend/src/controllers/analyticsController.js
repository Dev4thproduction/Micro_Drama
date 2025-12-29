const Series = require('../models/Series');
const Episode = require('../models/Episode');
const { sendSuccess } = require('../utils/response');

const incrementView = async (req, res, next) => {
    try {
        const { seriesId, episodeId } = req.body;

        if (!seriesId && !episodeId) {
            return next({ status: 400, message: 'Series ID or Episode ID required' });
        }

        if (seriesId) {
            await Series.findByIdAndUpdate(seriesId, { $inc: { views: 1 } });
        }

        if (episodeId) {
            await Episode.findByIdAndUpdate(episodeId, { $inc: { views: 1 } });
        }

        return sendSuccess(res, { message: 'View counted' });
    } catch (err) {
        return next(err);
    }
};

module.exports = { incrementView };
