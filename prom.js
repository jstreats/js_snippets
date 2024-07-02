const promBundle = require("express-prom-bundle");
const client = require('prom-client');
const eventLoopLag = require('event-loop-lag')(1000);
const gcStats = require('prometheus-gc-stats');
const fs = require('fs');

// Enhanced Prometheus configuration
const environment = process.env.NODE_ENV || 'development';
const appName = process.env.APP_NAME || 'DMD_API';

const metricsMiddlewareConfig = promBundle({
  includeMethod: true,
  includePath: true,
  customLabels: { app: appName, version: '1.0.0', env: environment },
  transformLabels: (labels, req, res) => {
    labels.statusCode = res.statusCode;
    labels.route = req.route ? req.route.path : req.path;
  },
  promClient: {
    collectDefaultMetrics: {
      timeout: 10000
    }
  }
});

// Collect default metrics including process and system metrics
client.collectDefaultMetrics({
  timeout: 5000
});

// Custom Counter metric
const customCounter = new client.Counter({
  name: 'custom_counter_total',
  help: 'A custom counter for tracking specific events',
  labelNames: ['event']
});

// Custom Histogram metric for request durations
const customHistogram = new client.Histogram({
  name: 'custom_histogram_duration_seconds',
  help: 'A custom histogram for tracking request durations',
  labelNames: ['method', 'route', 'statusCode']
});

// Additional custom metrics
const heapUsedGauge = new client.Gauge({
  name: 'nodejs_heap_memory_used_bytes',
  help: 'Heap memory used in bytes'
});

const eventLoopLagGauge = new client.Gauge({
  name: 'nodejs_event_loop_lag_seconds',
  help: 'Event loop lag in seconds'
});

const fileDescriptorsGauge = new client.Gauge({
  name: 'nodejs_open_file_descriptors',
  help: 'Number of open file descriptors'
});

const cpuUsageGauge = new client.Gauge({
  name: 'nodejs_process_cpu_usage_percent',
  help: 'CPU usage percent'
});

const uptimeGauge = new client.Gauge({
  name: 'nodejs_process_uptime_seconds',
  help: 'Process uptime in seconds'
});

// Setup GC stats
const startGcStats = gcStats(client.register);
startGcStats();

setInterval(() => {
  const memoryUsage = process.memoryUsage();
  heapUsedGauge.set(memoryUsage.heapUsed);
}, 5000);

setInterval(() => {
  eventLoopLagGauge.set(eventLoopLag() / 1000);
}, 1000);

setInterval(() => {
  fs.readdir('/proc/self/fd', (err, list) => {
    if (!err) {
      fileDescriptorsGauge.set(list.length);
    }
  });
}, 5000);

setInterval(() => {
  const cpuUsage = process.cpuUsage();
  const userCPU = cpuUsage.user / 1000000; // microseconds to milliseconds
  const systemCPU = cpuUsage.system / 1000000; // microseconds to milliseconds
  const totalCPU = userCPU + systemCPU;
  cpuUsageGauge.set(totalCPU);
}, 5000);

setInterval(() => {
  uptimeGauge.set(process.uptime());
}, 5000);

// Middleware function to record custom metrics
const customMetricsMiddleware = (req, res, next) => {
  const end = customHistogram.startTimer();
  
  res.on('finish', () => {
    customCounter.inc({ event: 'request' });
    end({ method: req.method, route: req.route ? req.route.path : req.path, statusCode: res.statusCode });
  });
  
  next();
};

// Endpoint to expose metrics
const exposeMetricsEndpoint = (app) => {
  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  });
};

module.exports = { metricsMiddlewareConfig, customMetricsMiddleware, exposeMetricsEndpoint };










const { metricsMiddlewareConfig, customMetricsMiddleware, exposeMetricsEndpoint } = require('./metricsMiddleware');

// Use the Prometheus metrics middleware
app.use(metricsMiddlewareConfig);
app.use(customMetricsMiddleware);

// Expose metrics endpoint
exposeMetricsEndpoint(app);
