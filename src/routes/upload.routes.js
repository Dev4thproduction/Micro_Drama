const express = require('express');
const { requestUploadUrl } = require('../controllers/uploadController');
const { allowRoles } = require('../middleware/auth');

const router = express.Router();

router.post('/presign', ...allowRoles(['creator', 'admin']), requestUploadUrl);

module.exports = router;
