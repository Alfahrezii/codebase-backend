const client = require('prom-client');

const increment = (metricName, value = 1) => {
  const counter = new client.Counter({
    name: metricName,
    help: `Counter of ${metricName}`,
    registers: [client.register],
  });
  counter.inc(value);
};

const decrement = (metricName, value = -1) => {
  const counter = new client.Counter({
    name: metricName,
    help: `Counter of ${metricName}`,
    registers: [client.register],
  });
  counter.dec(value);
};

const gauge = (metricName, value) => {
  const gauge = new client.Gauge({
    name: metricName,
    help: `Gauge of ${metricName}`,
    registers: [client.register],
  });
  if (value > 0) {
    gauge.inc(value);
  } else {
    gauge.dec(value);
  }
};

const histogram = (metricName, value) => {
  const histogram = new client.Histogram({
    name: metricName,
    help: `Histogram of ${metricName}`,
    registers: [client.register],
  });
  histogram.observe(value);
};

const timing = (metricName, value, event, status) => {
  const summary = new client.Summary({
    name: metricName,
    help: `Response time of ${metricName} in milliseconds`,
    labelNames: ['event', 'status'],
    registers: [client.register],
  });
  summary.labels({event: event, status: status}).observe(value);
};

module.exports = {
  increment,
  decrement,
  gauge,
  histogram,
  timing,
};
