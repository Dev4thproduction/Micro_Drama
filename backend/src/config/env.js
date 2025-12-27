const path = require('path');
const dotenv = require('dotenv');

const env = process.env.NODE_ENV || 'development';
const useInMemoryDb = process.env.USE_IN_MEMORY_DB === 'true';

// Load from .env in non-production environments
if (env !== 'production') {
  const envFile = process.env.ENV_FILE || path.resolve(process.cwd(), '.env');
  dotenv.config({ path: envFile });
}

const required = ['JWT_SECRET', 'AWS_REGION', 'AWS_S3_BUCKET'];
if (!useInMemoryDb) {
  required.unshift('MONGODB_URI');
}

const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

const config = {
  env,
  isProd: env === 'production',
  port: parseInt(process.env.PORT, 10) || 5000,
  useInMemoryDb,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  aws: {
    region: process.env.AWS_REGION,
    bucket: process.env.AWS_S3_BUCKET
  },
  corsOrigins: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
    : ['*']
};

module.exports = config;
