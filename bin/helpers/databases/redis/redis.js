const wrapper = require('../../utils/wrapper');
const pool = require('./connection');
const validate = require('validate.js');
const logger = require('../../utils/logger');

class Redis {

  constructor(config) {
    this.config = config.connection;
    this.index = config.index;
  }

  async selectDb(index) {
    let client = await pool.getConnection(this.config);
    if (validate.isEmpty(client)) {
      client = await pool.createConnectionPool(this.config);
    }
    const clientRedis = client[0].client;
    clientRedis.on('error', (err) => {
      logger.log('redis-selectDb', err, 'Client error occured on Redis');
    });

    clientRedis.select(index, async (err) => {
      if (err) {
        return wrapper.error(err, 'Failed to select db on Redis');
      }
    });
  }

  async setData(key, value) {
    let client = await pool.getConnection(this.config);
    if (validate.isEmpty(client)) {
      client = await pool.createConnectionPool(this.config);
    }
    const convertToString = JSON.stringify({
      data: value
    });
    const clientRedis = client[0].client;
    clientRedis.on('error', (err) => {
      logger.log('redis-setData', err, 'Client error occured on Redis');
    });
    clientRedis.select(this.index, async (err) => {
      if (err) {
        logger.log('redis-db', `change db to ${this.index}, : ${err}`, 'redis change db');
        return wrapper.error(err, 'Failed to select db on Redis');
      }
      clientRedis.set(key, convertToString);
    });
  }

  async setDataEx(key, value, duration) {
    let client = await pool.getConnection(this.config);
    if (validate.isEmpty(client)) {
      client = await pool.createConnectionPool(this.config);
    }
    const convertToString = JSON.stringify({
      data: value
    });
    const clientRedis = client[0].client;
    clientRedis.on('error', (err) => {
      logger.log('redis-setDataEx', err, 'Client error occured on Redis');
    });

    clientRedis.select(this.index, async (err) => {
      if (err) {
        logger.log('redis-db', `change db to ${this.index}, : ${err}`, 'redis change db');
        return wrapper.error(err, 'Failed to select db on Redis');
      }
      clientRedis.set(key, convertToString, 'EX', duration);
    });
  }

  async getData(key) {
    let client = await pool.getConnection(this.config);
    if (validate.isEmpty(client)) {
      client = await pool.createConnectionPool(this.config);
    }
    const clientRedis = client[0].client;

    clientRedis.on('error', (err) => {
      logger.log('redis-getData', err, 'Client error occured on Redis');
    });
    const result = new Promise(((resolve, reject) => {
      clientRedis.select(this.index, async (err) => {
        if (err) {
          logger.log('redis-db', `change db to ${this.index}, : ${err}`, 'redis change db');
          return reject(err);
        }
        clientRedis.get(key, (err, replies) => {
          if (err) {
            return reject(err);
          }
          return resolve(replies);
        });
      });
    }));

    return Promise.resolve(result)
      .then(res => wrapper.data(res))
      .catch(err => wrapper.error(`failed to get data, ${err}`));
  }

  async getAllKeys(key) {
    let client = await pool.getConnection(this.config);
    if (validate.isEmpty(client)) {
      client = await pool.createConnectionPool(this.config);
    }
    const clientRedis = client[0].client;

    clientRedis.on('error', (err) => {
      logger.log('redis-getAllKeys', err, 'Client error occured on Redis');
    });
    const result = new Promise(((resolve, reject) => {
      clientRedis.select(this.index, async (err) => {
        if (err) {
          logger.log('redis-db', `change db to ${this.index}, : ${err}`, 'redis change db');
          return reject(err);
        }
        clientRedis.keys(key, (err, replies) => {
          if (err) {
            return reject(err);
          }
          return resolve(replies);
        });
      });
    }));

    return Promise.resolve(result)
      .then(res => wrapper.data(res))
      .catch(err => wrapper.error(`failed to get all keys, ${err}`));
  }

  async deleteKey(key) {
    let client = await pool.getConnection(this.config);
    if (validate.isEmpty(client)) {
      client = await pool.createConnectionPool(this.config);
    }
    const clientRedis = client[0].client;

    clientRedis.on('error', (err) => {
      logger.log('redis-deleteKey', err, 'Client error occured on Redis');
    });
    const result = new Promise(((resolve, reject) => {
      clientRedis.select(this.index, async (err) => {
        if (err) {
          logger.log('redis-db', `change db to ${this.index}, : ${err}`, 'redis change db');
          return reject(err);
        }
        clientRedis.del(key, (err, replies) => {
          if (err) {
            return reject(err);
          }
          return resolve(replies);
        });
      });
    }));

    return Promise.resolve(result)
      .then(res => wrapper.data(res))
      .catch(err => wrapper.error(`failed to delete key, ${err}`));
  }

  async setZeroAttemp(key, duration) {
    let client = await pool.getConnection(this.config);
    if (validate.isEmpty(client)) {
      client = await pool.createConnectionPool(this.config);
    }
    const clientRedis = client[0].client;

    clientRedis.on('error', (err) => {
      logger.log('redis-setZeroAttemp', err, 'Client error occured on Redis');
    });
    const result = new Promise(((resolve, reject) => {
      clientRedis.set(key, 0, 'EX', duration, (err, replies) => {
        if (err) {
          return reject(err);
        }
        return resolve(replies);
      });
    }));

    return Promise.resolve(result)
      .then(res => wrapper.data(res))
      .catch(err => wrapper.error(`failed to set zero attempt, ${err}`));
  }

  async incrAttempt(key) {
    let client = await pool.getConnection(this.config);
    if (validate.isEmpty(client)) {
      client = await pool.createConnectionPool(this.config);
    }
    const clientRedis = client[0].client;

    clientRedis.on('error', (err) => {
      logger.log('redis-incrAttempt', err, 'Client error occured on Redis');
    });

    const result = new Promise(((resolve, reject) => {
      clientRedis.incr(key, (err, replies) => {
        if (err) {
          return reject(err);
        }
        return resolve(replies);
      });
    }));

    return Promise.resolve(result)
      .then(res => wrapper.data(res))
      .catch(err => wrapper.error(`failed to attempt increment, ${err}`));
  }

  async setReminder(key, value, expire, action) {
    let client = await pool.getConnection(this.config);
    if (validate.isEmpty(client)) {
      client = await pool.createConnectionPool(this.config);
    }
    const clientRedis = client[0].client;

    clientRedis.on('error', (err) => {
      logger.log('redis-setReminder', err, 'Client error occured on Redis');
    });
    const result = new Promise(((resolve, reject) => {
      clientRedis
        .multi()
        .set(`${action}-${key}`, value)
        .expire(`${action}-${key}`, expire)
        .exec((error, reply) => {
          if (error) {
            return reject(error);
          }
          return resolve(reply);
        });
    }));

    return Promise.resolve(result)
      .then(res => wrapper.data(res))
      .catch(err => wrapper.error(`failed to set reminder, ${err}`));
  }
}


module.exports = Redis;
