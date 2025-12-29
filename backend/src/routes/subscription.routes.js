const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth'); // Fixed import
const subController = require('../controllers/subscriptionController');

// Protect all routes
router.use(requireAuth);

router.get('/me', subController.getMySubscription);
router.post('/subscribe', subController.subscribe);
router.post('/cancel', subController.cancelSubscription);

module.exports = router;