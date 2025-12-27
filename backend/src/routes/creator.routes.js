const express = require('express');
const { allowRoles } = require('../middleware/auth');
const rateLimit = require('../middleware/rateLimit');
const {
  createSeries,
  listSeries,
  updateSeries,
  deleteSeries,
  createEpisode,
  listEpisodes,
  updateEpisode,
  deleteEpisode,
  createVideo,
  updateVideoStatus,
  listVideos,
  deleteVideo
} = require('../controllers/creatorController');

const router = express.Router();

router.use(...allowRoles(['creator', 'admin']));

router.post('/series', createSeries);
router.get('/series', listSeries);
router.put('/series/:seriesId', updateSeries);
router.delete('/series/:seriesId', deleteSeries);

router.post('/series/:seriesId/episodes', createEpisode);
router.get('/series/:seriesId/episodes', listEpisodes);
router.put('/series/:seriesId/episodes/:episodeId', updateEpisode);
router.delete('/series/:seriesId/episodes/:episodeId', deleteEpisode);

router.post('/videos', rateLimit({ windowMs: 60_000, max: 15 }), createVideo);
router.get('/videos', listVideos);
router.delete('/videos/:videoId', deleteVideo);
router.put('/videos/:videoId/status', updateVideoStatus);

module.exports = router;
