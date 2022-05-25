const apm = require('elastic-apm-node');
const project = require('../../../../package.json');
const config = require('../../../infra/configs/global_config');

const init = () => {
  apm.start({
    serviceName: project.name,
    serviceVersion: process.env.APP_VERSION || project.version,
    secretToken: config.get('/apm/secretToken'),
    apiKey: config.get('/apm/apiKey'),
    serverUrl: config.get('/apm/serverUrl'),
    captureExceptions: false,
    logUncaughtExceptions: true,
  });
};

module.exports = {
  init
};
