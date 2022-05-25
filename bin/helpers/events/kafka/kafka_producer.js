const kafka = require('kafka-node');
const logger = require('../../utils/logger');
const config = require('../../../infra/configs/global_config');
const client = new kafka.KafkaClient(config.get('/kafka'));
const producer = new kafka.HighLevelProducer(client);
const ctx = 'kafka-producer';

producer.on('ready', () => {
  logger.log(ctx, 'ready', 'Kafka Producer is connected and ready.');
});

const kafkaSendProducer = (data) => {
  const buffer = new Buffer.from(JSON.stringify(data.body));
  const record = [
    {
      topic: data.topic,
      messages: buffer,
      attributes: data.attributes,
      partitionerType: data.partition
    }
  ];
  producer.send(record, (err, data) => {
    if(err) {
      logger.log(ctx, 'error', 'producer-error-send');
    }
    logger.log(ctx, `Send data to ${JSON.stringify(data)}`, 'Data has been send');
  });
};


producer.on('error', async (error) => {
  logger.log(ctx, error, 'Kafka Producer Error');
});

module.exports = {
  kafkaSendProducer
};
