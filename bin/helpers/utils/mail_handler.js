const nodemailer = require('nodemailer');
const ctx = 'utils-mailHandler';
const logger = require('./logger');
const wrapper = require('./wrapper');
const config = require('../../infra/configs/global_config');
const { ExpectationFailedError } = require('../error');
const mailConfig = config.get('/mail');

const transport = nodemailer.createTransport({
  host: mailConfig.host,
  port: mailConfig.port,
  auth: {
    user: mailConfig.user,
    pass: mailConfig.pass,
  },
  secureConnection: 'false',
  tls: {
    ciphers: 'SSLv3'
  }
});

module.exports.send = async (html, emailUser, emailSubject) => {
  const mailOptions = {
    from: `${mailConfig.sender}<${mailConfig.user}>`,
    to: emailUser,
    subject: emailSubject,
    html,
    text: html
  };
  try {
    return await transport.sendMail(mailOptions);
  } catch (err) {
    logger.log(ctx, err, 'Fail to send the message');
    return wrapper.error(new ExpectationFailedError('Fail to send the message'));
  }
};
