const AppServer = require('./bin/app/server');
// const configs = require('./bin/infra/configs/global_config');
// const logger = require('./bin/helpers/utils/logger');
const appServer = new AppServer();
// const port = process.env.PORT || configs.get('/port') || 1337;
const port = 1338; 

appServer.server.listen(port, () => {
  const ctx = 'app-listen';
  // logger.log(ctx, `${appServer.server.name} started, listening at ${appServer.server.url}`, 'initate application');
});
