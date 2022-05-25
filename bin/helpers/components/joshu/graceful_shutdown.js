const logger = require('../../utils/logger');

class GracefulShutdown {

  constructor(terminationDelay) {
    this.terminationDelay = terminationDelay;
    this.shutdown = false;
  }

  enable(server) {
    let handler = () => {
      logger.log('joshu-enable', 'Termination signal received, try to shut down the server.');
      this.shutdown = true;

      // delay termination
      sleep(this.terminationDelay * 1000).then( () => {

        // close the server
        server.close(() => {
          logger.log('joshu-enable', 'Server closed.');
          process.exit(0);
        });
      });
    };

    process.on('SIGINT', handler);
    process.on('SIGTERM', handler);
  }
}

const sleep = (waitTimeInMs) =>{
  return new Promise(((resolve) => { return setTimeout(resolve, waitTimeInMs); }));
};

const readinessProbe = (gs) => (req, res) => {
  if(gs.shutdown) {
    res.send(503, { status: 503, message: 'server is shutting down' });
  } else {
    res.send(200, { status: 200, message: 'ok' });
  }
};

const livenessProbe = (gs) => (req, res) => {
  res.send(200, { status: 200, message: 'ok' });
};

module.exports = {
  GracefulShutdown,
  readinessProbe,
  livenessProbe,
};
