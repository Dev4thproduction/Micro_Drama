const express = require('express');
const { getHome, getSeriesEpisodes, getDiscover } = require('../controllers/browseController');

const router = express.Router();

// Public routes
router.get('/home', getHome);
router.get('/discover', getDiscover);
router.get('/series/:seriesId/episodes', getSeriesEpisodes);
router.get('/series/:seriesId', require('../controllers/browseController').getSeriesDetails);
router.post('/following', require('../controllers/browseController').getFollowingUpdates);

module.exports = router;
