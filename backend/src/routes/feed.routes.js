const express = require('express');
const { getFeed } = require('../controllers/feedController');

const router = express.Router();

// Public route - no auth middleware needed for general feed
router.get('/', getFeed);

module.exports = router;
