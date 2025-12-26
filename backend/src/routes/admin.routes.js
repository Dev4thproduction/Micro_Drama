const express = require('express');
const { allowRoles } = require('../middleware/auth');
const {
  listPendingSeries,
  listPendingEpisodes,
  approveEpisode,
  toggleSubscription
} = require('../controllers/adminController');

const router = express.Router();

router.use(...allowRoles(['admin']));

router.get('/series/pending', listPendingSeries);
router.get('/episodes/pending', listPendingEpisodes);
router.post('/episodes/:episodeId/approve', approveEpisode);
router.post('/users/:userId/subscription', toggleSubscription);

module.exports = router;
