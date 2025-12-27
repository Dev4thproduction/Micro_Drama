const express = require('express');
const { requestUploadUrl } = require('../controllers/uploadController');
const { allowRoles } = require('../middleware/auth');
const rateLimit = require('../middleware/rateLimit');

const router = express.Router();

router.post(
  '/presign',
  rateLimit({ windowMs: 60_000, max: 10 }),
  ...allowRoles(['creator', 'admin']),
  requestUploadUrl
);

module.exports = router;
