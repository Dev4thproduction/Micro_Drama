const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const config = require('../config/env');

const bucket = config.aws.bucket;
const region = config.aws.region;

const s3Client = new S3Client({ region });

const createPresignedUploadUrl = async ({ key, contentType, expiresInSeconds = 300 }) => {
  if (!key) {
    throw new Error('S3 key is required for presigning');
  }

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
  return uploadUrl;
};

const createPresignedGetUrl = async ({ key, expiresInSeconds = 300 }) => {
  if (!key) {
    throw new Error('S3 key is required for presigning');
  }

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key
  });

  const getUrl = await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
  return getUrl;
};

module.exports = { createPresignedUploadUrl, createPresignedGetUrl };
