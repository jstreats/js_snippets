

To measure network latency of an Express.js endpoint and make it available to Prometheus, you can use the `prom-client` library for collecting metrics and the `express-prometheus-middleware` for exposing these metrics. Here's a step-by-step guide:
### Step 1: Install the necessary libraries 

First, install the required libraries using npm:


```sh
npm install prom-client express-prometheus-middleware
```

### Step 2: Set up Prometheus metrics collection in your Express.js app 

In your Express.js application, set up the Prometheus metrics collection and expose the metrics endpoint.


```javascript
const express = require('express');
const promClient = require('prom-client');
const promMid = require('express-prometheus-middleware');

const app = express();

// Create a Registry which registers the metrics
const register = new promClient.Registry();

// Add a default metric for node.js process
promClient.collectDefaultMetrics({ register });

// Create a custom Histogram metric for measuring response time
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5]
});

register.registerMetric(httpRequestDurationMicroseconds);

// Add the express-prometheus-middleware to automatically measure request durations
app.use(
  promMid({
    metricsPath: '/metrics',
    collectDefaultMetrics: false,
    requestDurationBuckets: [0.1, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5],
    customLabels: { project_name: 'my_project', project_type: 'test_metrics' },
    transformLabels: labels => Object.assign(labels, { project_name: 'my_project', project_type: 'test_metrics' }),
    metricsApp: null,
    authenticate: req => req.headers.authorization === 'mysecrettoken',
    extraMasks: [/..some regex here../],
    metricTypes: ['httpRequestsTotal', 'httpRequestDurationPerPercentile', 'httpRequestsSize'],
    httpDurationMetricName: 'http_request_duration_seconds',
    normalizePath: (req, opts) => {
      if (opts && opts.normalizePath) {
        return opts.normalizePath(req, opts);
      }
      return req.path;
    }
  })
);

// Your other routes here
app.get('/your-endpoint', (req, res) => {
  // Your endpoint logic
  res.send('Hello, world!');
});

// Expose the default Prometheus metrics at /metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

### Step 3: Configure Prometheus 
Prometheus needs to be configured to scrape the metrics from your Express.js application. Add a job in your Prometheus configuration file (`prometheus.yml`):

```yaml
scrape_configs:
  - job_name: 'express_app'
    static_configs:
      - targets: ['<YOUR_SERVER_IP>:3000'] # Change the port if you are using a different port
```

### Step 4: Run Prometheus 
Ensure Prometheus is running and configured correctly. You can check the `/metrics` endpoint of your Express.js app to see if metrics are being exposed.
### Step 5: Monitor and Visualize 
Once Prometheus is scraping the metrics, you can use Prometheus queries to monitor the latency of your endpoints. For example, to view the 95th percentile latency of your `/your-endpoint`, you can use the following query:

```less
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{route="/your-endpoint"}[5m])) by (le))
```

To visualize these metrics, you can use Grafana or any other visualization tool that supports Prometheus as a data source.

This setup will allow you to measure network latency of your Express.js endpoints and make it available to Prometheus for monitoring and visualization.
