const userEventHandler = require('./user-v2/handlers/event_handler');
const logger = require('../helpers/utils/logger');

const init = () => {
  logger.log('info','Observer is Running...','myEmitter.init');
  initEventListener();
};
const initEventListener = () => {
  userEventHandler.sendEmailOtp();
  userEventHandler.sendSmsOtp();
};

module.exports = {
  init: init
};
