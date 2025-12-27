const crypto = require('crypto');
const path = require('path');
const { createPresignedUploadUrl } = require('../utils/s3');
const { sendSuccess } = require('../utils/response');

const MAX_UPLOAD_BYTES = 1024 * 1024 * 1024; // 1GB cap for safety
const ALLOWED_MIME_PREFIX = 'video/';

const requestUploadUrl = async (req, res, next) => {
  try {
    const { contentType, fileName, sizeBytes } = req.body || {};
    const userId = req.user && req.user.id;

    if (!userId) {
      return next({ status: 401, message: 'Authentication required' });
    }

    if (!contentType || typeof contentType !== 'string') {
      return next({ status: 400, message: 'contentType is required' });
    }
    if (!contentType.startsWith(ALLOWED_MIME_PREFIX)) {
      return next({ status: 400, message: 'Only video uploads are allowed' });
    }
    if (fileName && typeof fileName !== 'string') {
      return next({ status: 400, message: 'fileName must be a string if provided' });
    }
    if (sizeBytes !== undefined) {
      if (typeof sizeBytes !== 'number' || sizeBytes <= 0) {
        return next({ status: 400, message: 'sizeBytes must be a positive number' });
      }
      if (sizeBytes > MAX_UPLOAD_BYTES) {
        return next({ status: 400, message: 'File too large. Max allowed is 1GB.' });
      }
    }

    const ext = fileName ? path.extname(fileName).toLowerCase() : '';
    const random = crypto.randomBytes(12).toString('hex');
    const s3Key = path.posix.join('uploads', userId, `${Date.now()}-${random}${ext}`);

    const uploadUrl = await createPresignedUploadUrl({
      key: s3Key,
      contentType,
      expiresInSeconds: 300
    });

    return sendSuccess(res, { s3Key, uploadUrl });
  } catch (err) {
    return next(err);
  }
};

module.exports = { requestUploadUrl };
