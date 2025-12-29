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

const signCloudinaryUpload = async (req, res, next) => {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      return next({ status: 500, message: 'Cloudinary is not configured on the server' });
    }

    const { folder, resource_type, eager, upload_preset } = req.body || {};
    const timestamp = Math.floor(Date.now() / 1000);

    // Build params object for signature
    const params = { timestamp };
    if (folder && typeof folder === 'string') params.folder = folder;
    if (eager && typeof eager === 'string') params.eager = eager;
    if (upload_preset && typeof upload_preset === 'string') params.upload_preset = upload_preset;

    // Sort params alphabetically and create signature string
    const sortedKeys = Object.keys(params).sort();
    const signatureString = sortedKeys.map(key => `${key}=${params[key]}`).join('&') + apiSecret;
    const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

    return sendSuccess(res, {
      cloudName,
      apiKey,
      timestamp,
      folder: params.folder,
      signature,
      // Return the upload URL for convenience
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/${resource_type || 'auto'}/upload`
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = { requestUploadUrl, signCloudinaryUpload };
