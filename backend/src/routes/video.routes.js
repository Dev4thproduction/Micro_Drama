const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getPlaybackUrl, saveProgress } = require('../controllers/videoController');

const router = express.Router();

router.get('/play/:episodeId', requireAuth, getPlaybackUrl);
router.post('/progress', requireAuth, saveProgress);

module.exports = router;
