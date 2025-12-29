const express = require('express');
const { requestUploadUrl, signCloudinaryUpload } = require('../controllers/uploadController');
const { allowRoles } = require('../middleware/auth');

const router = express.Router();

router.post('/presign', ...allowRoles(['creator', 'admin']), requestUploadUrl);
router.post('/cloudinary/sign', ...allowRoles(['creator', 'admin']), signCloudinaryUpload);

module.exports = router;
