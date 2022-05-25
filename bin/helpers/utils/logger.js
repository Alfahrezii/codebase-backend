const winston = require('winston');
const morgan  = require('morgan');
require('winston-logstash');
const config = require('../../infra/configs/global_config');

let logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: 'info',
      handleExceptions: true,
      json: false,
      colorize: true,
    }),
    new winston.transports.Logstash(config.get('/logstash'))
  ],
  exitOnError: false
});

const log = (context, message, scope) => {
  const obj = {
    context,
    scope,
    message: message.toString()
  };
  logger.info(obj);
};

const info = (context, message, scope, meta) => {
  const obj = {
    context,
    scope,
    message: message,
    meta
  };
  logger.info(obj);
};

const error = (context, message, scope, meta) => {
  const obj = {
    context,
    scope,
    message: message,
    meta
  };
  logger.error(obj);
};

const init = () => {
  return morgan((tokens, req, res) => {
    const logData = {
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      code: tokens.status(req, res),
      contentLength: tokens.res(req, res, 'content-length'),
      responseTime: `${tokens['response-time'](req, res, '0')}`, // in milisecond (ms)
      date: tokens.date(req, res, 'iso'),
      ip: tokens['remote-addr'](req,res)
    };
    const obj = {
      context: 'service-info',
      scope: 'audit-log',
      message: 'Logging service...',
      meta: logData
    };
    logger.info(obj);
  });
};

module.exports = {
  log,
  init,
  info,
  error
};
