const tracer = require('dd-trace');
const StatsD = require('hot-shots');
const project = require('../../../../package.json');
const config = require('../../../infra/configs/global_config');

const init = () => {
  tracer.init({
    env: config.get('/ddTrace/env'),
    service: project.name,
    version: process.env.APP_VERSION || project.version,
    host: config.get('/ddTrace/host'),
    port: config.get('/ddTrace/port'),
  });
};

const dogstatsd = new StatsD({
  host: config.get('/ddTrace/host'),
  port: config.get('/ddTrace/dogstatdPort'),
  globalTags: {
    env: config.get('/appEnv')
  },
});

module.exports = {
  init,
  dogstatsd,
};
