const { sendSuccess } = require('../utils/response');

const healthCheck = (req, res) => {
  sendSuccess(res, {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
};

module.exports = { healthCheck };
