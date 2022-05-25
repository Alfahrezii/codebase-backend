const project = require('../../../../package.json');
const client = require('prom-client');
const ResponseTime = require('response-time');

client.register.setDefaultLabels({
  app: project.name
});

const responses = new client.Summary({
  name: 'http_request_duration_ms',
  help: 'Response time in milliseconds',
  labelNames: ['method', 'path', 'status']
});

const startCollection = () => {
  client.collectDefaultMetrics();
};

const responseCounters = ResponseTime((req, res, time) => {
  if(req.url != '/metrics') {
    responses.labels(req.method, req.url, res.statusCode).observe(time);
  }
});

const injectMetricsRoute = (App) => {
  App.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', client.register.contentType);
    res.send(await client.register.metrics());
  });
};

module.exports = {
  startCollection,
  responseCounters,
  injectMetricsRoute,
};
