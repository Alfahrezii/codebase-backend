const kafka = require('kafka-node');
const ConsumerGroupStream = kafka.ConsumerGroupStream;
const config = require('../../../infra/configs/global_config');
class ConsumerKafka {
  constructor(data) {
    let options = {
      kafkaHost: config.get('/kafka').kafkaHost,// connect directly to kafka broker (instantiates a KafkaClient)
      autoCommit: false,
      groupId: data.groupId,
      heartbeatInterval: 3000,
      sessionTimeout: 30000,
      fetchMaxBytes: 10 * 1024,
      protocol: ['roundrobin'],
      fromOffset: 'earliest', // default
      encoding: 'utf8',
      keyEncoding: 'utf8'
    };
    return new ConsumerGroupStream(options,data.topic);
  }
}

module.exports = ConsumerKafka;
