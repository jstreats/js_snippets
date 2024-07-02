const promClient = require('prom-client');
const promMid = require('express-prometheus-middleware');



// Enable collection of default metrics
promClient.collectDefaultMetrics();

// Set up Prometheus middleware
app.use(promMid({
  metricsPath: '/metrics',
  collectDefaultMetrics: true,
  metricsApp: app,
  customLabels: { project_name: 'dmd_api', environment: process.env.NODE_ENV,port:7000 },
  transformLabels: labels => Object.assign(labels, { project_name: 'dmd_api', environment: process.env.NODE_ENV }),
}));
