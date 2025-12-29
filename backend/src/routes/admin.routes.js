const express = require('express');
const router = express.Router();
const { allowRoles } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Apply admin check to all routes
router.use(...allowRoles(['admin']));

// --- DASHBOARD & ANALYTICS ---
router.get('/stats', adminController.getDashboardStats);
router.get('/analytics', adminController.getAnalytics);

// --- USER MANAGEMENT ---
router.get('/users', adminController.getUsers);
router.patch('/users/:userId/status', adminController.updateUserStatus);
router.post('/create-admin', adminController.createAdmin);

// --- MODERATION ---
router.get('/series/pending', adminController.listPendingSeries);
router.get('/episodes/pending', adminController.listPendingEpisodes);
router.post('/episodes/:episodeId/approve', adminController.approveEpisode);
router.patch('/reject-episode/:episodeId', adminController.rejectEpisode);

// --- SUBSCRIPTIONS ---
router.get('/subscriptions', adminController.getSubscribers);
router.post('/users/:userId/subscription', adminController.toggleSubscription);

module.exports = router;