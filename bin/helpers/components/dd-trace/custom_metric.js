const config = require('../../../infra/configs/global_config');
const StatsD = require('hot-shots');

const client = new StatsD({
  host: 'localhost',
  port: 8125,
  globalTags: {
    env: config.get('/ddTrace/env')
  },
});

const increment = (metricName, value = 1) => {
  client.increment(metricName, value);
};

const decrement = (metricName, value = -1) => {
  client.decrement(metricName, value);
};

const gauge = (metricName, value) => {
  client.gauge(metricName, value);
};

const distribution = (metricName, value) => {
  client.distribution(metricName, value);
};

const histogram = (metricName, value) => {
  client.histogram(metricName, value);
};

const timing = (metricName, value, event, status) => {
  client.event(event, status);
  client.timing(metricName, value);
};

module.exports = {
  increment,
  decrement,
  gauge,
  distribution,
  histogram,
  timing,
};
