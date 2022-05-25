const kafka = require('kafka-node');
const Consumer = kafka.ConsumerGroup;
const config = require('../../../infra/configs/global_config');
class ConsumerKafka {
  constructor(data) {
    let options = {
      kafkaHost: config.get('/kafka').kafkaHost,// connect directly to kafka broker (instantiates a KafkaClient)
      autoCommit: false,
      groupId: data.groupId,
      sessionTimeout: 6000,
      idleConnection: 3000,
      topicPartitionCheckInterval: 3000,
      fetchMaxBytes: 10 * 1024,
      commitOffsetsOnFirstJoin: true,
      autoCommitIntervalMs: 0,
      protocol: ['roundrobin'],
      fromOffset: 'earliest', // default
      encoding: 'utf8',
      keyEncoding: 'utf8',
    };
    return new Consumer(options,data.topic);
  }
}

module.exports = ConsumerKafka;
