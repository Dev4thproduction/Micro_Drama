const express = require('express');
const router = express.Router();
// CHANGE: import 'requireAuth'
const { requireAuth } = require('../middleware/auth'); 
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);

// CHANGE: Use 'requireAuth' here
router.patch('/profile', requireAuth, authController.updateProfile);

module.exports = router;