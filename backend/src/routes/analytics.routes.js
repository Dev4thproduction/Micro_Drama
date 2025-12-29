const express = require('express');
const { incrementView } = require('../controllers/analyticsController');

const router = express.Router();

// Public route to count views
router.post('/view', incrementView);

module.exports = router;
