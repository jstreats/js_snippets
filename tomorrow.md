const os = require('os');

const memoryUsageMiddleware = (req, res, next) => {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const memoryUsagePercent = (usedMemory / totalMemory) * 100;

  if (memoryUsagePercent > 85) {
    return res.status(503).json({ message: 'Service unavailable due to high memory usage' });
  }

  next();
};

module.exports = memoryUsageMiddleware;