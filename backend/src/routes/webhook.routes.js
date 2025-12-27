const express = require('express');
const { handleProcessingWebhook } = require('../controllers/webhookController');

const router = express.Router();

// In production, protect this with a shared secret header.
router.post('/processing', handleProcessingWebhook);

module.exports = router;
