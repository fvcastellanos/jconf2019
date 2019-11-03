
const metricsClient = require('prom-client');
const collectDefaultMetrics = metricsClient.collectDefaultMetrics;

collectDefaultMetrics({
    prefix: "capture_api_",
    timeout: 5000
});

export default metricsClient;