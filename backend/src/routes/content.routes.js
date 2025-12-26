const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
  listPublishedSeries,
  listPublishedEpisodes,
  getEpisodeDetails
} = require('../controllers/contentController');

const router = express.Router();

router.get('/series', requireAuth, listPublishedSeries);
router.get('/series/:seriesId/episodes', requireAuth, listPublishedEpisodes);
router.get('/episodes/:episodeId', requireAuth, getEpisodeDetails);

module.exports = router;
