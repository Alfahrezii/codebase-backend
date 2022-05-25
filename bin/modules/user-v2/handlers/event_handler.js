const kafkaConsumer = require('../../../helpers/events/kafka/kafka_consumer');
const producer = require('../../../helpers/events/kafka/kafka_producer');
const commandHandler = require('../repositories/commands/command_handler');
const logger = require('../../../helpers/utils/logger');
const project = require('../../../../package.json');
const config = require('../../../infra/configs/global_config');
let async = require('async');

// Custom Metrics
const { metric } = require('../../../helpers/components/monitoring/observability');
const { performance } = require('perf_hooks');

/* SEND OTP TO EMAIL AFTER USER REGISTRATION */

let emailOtpLastOffset = 0;
const emailOtpMaxWorker = 30;
const emailOtpConsumer = new kafkaConsumer({
  topic: 'register-user-by-email',
  groupId: 'registered-user-by-email-1'
});

const sendEmailOtp = async () => {
  emailOtpConsumer.on('message', async (message) => {
    emailOtpConsumer.pause();
    readEmailOtpConsumer(message);
  });
};

const readEmailOtpConsumer = (message) => {
  const startTime = performance.now();
  sendEmailOtpQueue.push(message, async (err) => {
    if (err) {
      const payload = {
        message: {
          ...message,
          value: JSON.parse(message.value)
        },
        error: err.message,
        service: `${project.name}@${project.version}`,
        timestamp: new Date(),
      };
      const dataToKafka = {
        topic: 'dlq-register-user-by-email',
        attributes: 1,
        body: payload,
        partition: 1
      };
      producer.kafkaSendProducer(dataToKafka);
      logger.error('registered-user-by-email-worker', err, 'Dead letter queue occured');
    }
    if (emailOtpLastOffset < message.offset) {
      emailOtpLastOffset = message.offset;
    }
    if (config.get('/monitoring') !== 0) {
      metric.timing('send_otp_duration_ms', performance.now() - startTime, 'registration-email-otp', 200);
    }
  });
};

const sendEmailOtpQueue = async.queue(async (message, callback) => {
  const payload = JSON.parse(message.value);
  const result = await commandHandler.sendEmailOtp(payload);
  if (result.err) {
    return callback(result.err);
  }
  return callback(null);
}, emailOtpMaxWorker);

sendEmailOtpQueue.drain = () => {
  emailOtpConsumer.setOffset(
    emailOtpConsumer.topic,
    emailOtpConsumer.partition,
    emailOtpLastOffset + 1
  );
  emailOtpConsumer.commit(true, async (err) => {
    if (err) {
      logger.error('registered-user-by-email-worker', err, 'Could not commit to Kafka');
    }
  });
  emailOtpConsumer.resume();
};

/* SEND OTP TO MOBILE NUMBER AFTER USER REGISTRATION */

let smsOtpLastOffset = 0;
const smsOtpMaxWorker = 30;
const smsOtpConsumer = new kafkaConsumer({
  topic: 'register-user-by-mobile-number',
  groupId: 'registered-user-by-mobile-number-1'
});

const sendSmsOtp = async () => {
  smsOtpConsumer.on('message', async (message) => {
    smsOtpConsumer.pause();
    readSmsOtpConsumer(message);
  });
};

const readSmsOtpConsumer = (message) => {
  const startTime = performance.now();
  sendSmsOtpQueue.push(message, async (err) => {
    if (err) {
      const payload = {
        message: {
          ...message,
          value: JSON.parse(message.value)
        },
        error: err.message,
        service: `${project.name}@${project.version}`,
        timestamp: new Date(),
      };
      const dataToKafka = {
        topic: 'dlq-register-user-by-mobile-number',
        attributes: 1,
        body: payload,
        partition: 1
      };
      producer.kafkaSendProducer(dataToKafka);
      logger.error('registered-user-by-mobile-number-worker', err, 'Dead letter queue occured');
    }
    if (smsOtpLastOffset < message.offset) {
      smsOtpLastOffset = message.offset;
    }
    if (config.get('/monitoring') !== 0) {
      metric.timing('send_otp_duration_ms', performance.now() - startTime, 'registration-sms-otp', 200);
    }
  });
};

const sendSmsOtpQueue = async.queue(async (message, callback) => {
  const payload = JSON.parse(message.value);
  const result = await commandHandler.sendSmsOtp(payload);
  if (result.err) {
    return callback(result.err);
  }
  return callback(null);
}, smsOtpMaxWorker);

sendSmsOtpQueue.drain = () => {
  smsOtpConsumer.setOffset(
    smsOtpConsumer.topic,
    smsOtpConsumer.partition,
    smsOtpLastOffset + 1
  );
  smsOtpConsumer.commit(true, async (err) => {
    if (err) {
      logger.error('registered-user-by-mobile-number-worker', err, 'Could not commit to Kafka');
    }
  });
  smsOtpConsumer.resume();
};

module.exports = {
  sendEmailOtp,
  sendSmsOtp,
};
