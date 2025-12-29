const crypto = require('crypto');
const path = require('path');
const { createPresignedUploadUrl } = require('../utils/s3');
const { sendSuccess } = require('../utils/response');

const requestUploadUrl = async (req, res, next) => {
  try {
    const { contentType, fileName } = req.body || {};
    const userId = req.user && req.user.id;

    if (!userId) {
      return next({ status: 401, message: 'Authentication required' });
    }

    if (!contentType || typeof contentType !== 'string') {
      return next({ status: 400, message: 'contentType is required' });
    }
    if (fileName && typeof fileName !== 'string') {
      return next({ status: 400, message: 'fileName must be a string if provided' });
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

const signCloudinary = async (req, res, next) => {
  try {
    const { folder } = req.body;
    const timestamp = Math.round((new Date()).getTime() / 1000);
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    if (!apiSecret || !apiKey || !cloudName) {
      return next({ status: 500, message: 'Cloudinary not configured' });
    }

    // Parameters to sign (ordered by key)
    const params = {
      timestamp,
      upload_preset: 'ml_default', // Ensure this matches frontend
    };
    if (folder) params.folder = folder;

    // Create signature string
    const sortedKeys = Object.keys(params).sort();
    const signString = sortedKeys.map(key => `${key}=${params[key]}`).join('&') + apiSecret;

    const signature = crypto.createHash('sha1').update(signString).digest('hex');

    return sendSuccess(res, {
      signature,
      timestamp,
      cloudName,
      apiKey,
      upload_preset: params.upload_preset
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = { requestUploadUrl, signCloudinary };
