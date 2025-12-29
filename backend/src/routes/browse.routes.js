const express = require('express');
const { getHome, getSeriesEpisodes, getDiscover } = require('../controllers/browseController');

const router = express.Router();

// Public routes
router.get('/home', getHome);
router.get('/discover', getDiscover);
router.get('/series/:seriesId/episodes', getSeriesEpisodes);

module.exports = router;
