const mongoose = require('mongoose');
const config = require('./env');

const connectDB = async () => {
  const uri = config.mongoUri;

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error', err);
    process.exit(1);
  }
};

module.exports = { connectDB };
