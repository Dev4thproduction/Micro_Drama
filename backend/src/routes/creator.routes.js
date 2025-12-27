const express = require('express');
const { allowRoles } = require('../middleware/auth');
const {
  createSeries,
  listSeries,
  createEpisode,
  listEpisodes,
  createVideo,
  listVideos
} = require('../controllers/creatorController');

const router = express.Router();

router.use(...allowRoles(['creator', 'admin']));

router.post('/series', createSeries);
router.get('/series', listSeries);

router.post('/series/:seriesId/episodes', createEpisode);
router.get('/series/:seriesId/episodes', listEpisodes);

router.post('/videos', createVideo);
router.get('/videos', listVideos);

module.exports = router;
