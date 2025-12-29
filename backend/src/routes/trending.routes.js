const express = require('express');
const { getTrending } = require('../controllers/trendingController');

const router = express.Router();

// GET /api/trending
// Query params: category (slug), limit (number)
router.get('/', getTrending);

module.exports = router;
