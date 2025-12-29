const express = require('express');
const { requestUploadUrl, signCloudinary } = require('../controllers/uploadController');
const { allowRoles } = require('../middleware/auth');

const router = express.Router();

router.post('/presign', ...allowRoles(['creator', 'admin']), requestUploadUrl);
router.post('/cloudinary/sign', ...allowRoles(['creator', 'admin']), signCloudinary);

module.exports = router;
