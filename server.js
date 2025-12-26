const http = require('http');
const mongoose = require('mongoose');
const config = require('./src/config/env');
const app = require('./app');
const { connectDB } = require('./src/config/db');

const PORT = config.port;
let server;

const start = async () => {
  try {
    await connectDB();
    server = http.createServer(app).listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log(`Received ${signal}, shutting down gracefully...`);
  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await mongoose.connection.close(false);
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown', err);
    process.exit(1);
  }
};

['SIGINT', 'SIGTERM'].forEach((sig) => {
  process.on(sig, () => shutdown(sig));
});

start();
