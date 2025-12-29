const express = require('express');
const { allowRoles } = require('../middleware/auth');
const {
  listPendingSeries,
  listPendingEpisodes,
  approveEpisode,
  toggleSubscription,
  listAllSeries,
  listEpisodesBySeries,
  getAdminStats,
  listUsers,
  updateUserStatus,
  listSubscriptions,
  updateSubscription,
  createAdminEpisode,
  updateAdminEpisode,
  deleteAdminEpisode,
  createAdminSeries,
  updateAdminSeries,
  deleteAdminSeries,
  listSeasonsBySeries,
  createSeason,
  updateSeason,
  deleteSeason,
  createAdmin
} = require('../controllers/adminController');
const {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  listSeriesByCategory
} = require('../controllers/categoryController');

const router = express.Router();

router.use(...allowRoles(['admin']));

// Categories
router.get('/categories', listCategories);
router.post('/categories', createCategory);
router.get('/categories/:categoryId', getCategory);
router.patch('/categories/:categoryId', updateCategory);
router.delete('/categories/:categoryId', deleteCategory);
router.get('/categories/:categoryId/series', listSeriesByCategory);

// Series, Seasons & Episodes
router.get('/series/pending', listPendingSeries);
router.get('/episodes/pending', listPendingEpisodes);
router.post('/episodes/:episodeId/approve', approveEpisode);
router.get('/series', listAllSeries);
router.post('/series', createAdminSeries);
router.patch('/series/:seriesId', updateAdminSeries);
router.delete('/series/:seriesId', deleteAdminSeries);
router.get('/series/:seriesId/seasons', listSeasonsBySeries);
router.post('/series/:seriesId/seasons', createSeason);
router.patch('/seasons/:seasonId', updateSeason);
router.delete('/seasons/:seasonId', deleteSeason);
router.get('/series/:seriesId/episodes', listEpisodesBySeries);
router.post('/series/:seriesId/episodes', createAdminEpisode);
router.patch('/episodes/:episodeId', updateAdminEpisode);
router.delete('/episodes/:episodeId', deleteAdminEpisode);

// Stats
router.get('/stats', getAdminStats);

// User management
router.get('/users', listUsers);
router.post('/users/admin', createAdmin);
router.patch('/users/:userId', updateUserStatus);
router.post('/users/:userId/subscription', toggleSubscription);

// Subscription management
router.get('/subscriptions', listSubscriptions);
router.patch('/subscriptions/:subscriptionId', updateSubscription);

module.exports = router;
