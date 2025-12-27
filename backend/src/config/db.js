const mongoose = require('mongoose');
const config = require('./env');
let memoryServer;

const connectDB = async () => {
  try {
    if (config.useInMemoryDb) {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const uri = memoryServer.getUri();
      await mongoose.connect(uri);
      console.log('MongoDB (in-memory) connected');
      return;
    }

    await mongoose.connect(config.mongoUri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error', err);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close(false);
    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = null;
    }
  } catch (err) {
    console.error('Error closing database connection', err);
  }
};

module.exports = { connectDB, disconnectDB };
