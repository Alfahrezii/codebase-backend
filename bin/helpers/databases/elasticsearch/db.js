const validate = require('validate.js');

const wrapper = require('../../utils/wrapper');
const logger = require('../../utils/logger');
const conn = require('./connection');

const beutifyResult = (payload) => {
  const { hits: { hits } } = payload;
  return hits.map(({ _source }) => (_source));
};

const createIndex = async (config, payload) => {
  let esClient = await conn.getConnection(config);
  let result = new Promise((resolve, reject) => {
    esClient.indices.create(payload, (error, response) => {
      if (error) {
        logger.log('elasticsearch-createIndex', error, 'error');
        reject(error);
      }
      resolve(response);
    });
  });
  return Promise.resolve(result)
    .then(res => wrapper.data(res))
    .catch(err => wrapper.error(`failed to create index, ${err}`));
};

const getAllIndex = async (config, idx) => {
  let esClient = await conn.getConnection(config);
  let result = new Promise((resolve, reject) => {
    esClient.cat.indices(idx || {}, (error, response) => {
      if (error) {
        logger.log('elasticsearch-getAllIndex', error, 'error');
        reject(error);
      }
      resolve(response);
    });
  });
  return Promise.resolve(result)
    .then(res => wrapper.data(res))
    .catch(err => wrapper.error(`failed to create index, ${err}`));
};

const insertData = async (config, payload) => {
  let esClient = await conn.getConnection(config);
  let result = new Promise((resolve, reject) => {
    esClient.index(payload, (error, response) => {
      if (error) {
        logger.log('elasticsearch-insertData', error, 'error');
        reject(error);
      }
      resolve(response);
    });
  });
  return Promise.resolve(result)
    .then(res => wrapper.data(res))
    .catch(err => wrapper.error(`failed to create index, ${err}`));
};

const countData = async (config, payload) => {
  let esClient = await conn.getConnection(config);
  let result = new Promise((resolve, reject) => {
    esClient.count(payload, (error, response) => {
      if (error) {
        logger.log('elasticsearch-countData', error, 'error');
        reject(error);
      }
      resolve(response);
    });
  });
  return Promise.resolve(result)
    .then(res => wrapper.data(res))
    .catch(err => wrapper.error(`failed to count data, ${err}`));
};

const deleteData = async (config, payload) => {
  let esClient = await conn.getConnection(config);
  let result = new Promise((resolve, reject) => {
    esClient.delete(payload, (error, response) => {
      if (error) {
        logger.log('elasticsearch-deleteData', error, 'error');
        reject(error);
      }
      resolve(response);
    });
  });
  return Promise.resolve(result)
    .then(res => wrapper.data(res))
    .catch(err => wrapper.error(`failed to delete data, ${err}`));
};

const updateData = async (config, payload) => {
  const esClient = await conn.getConnection(config);
  const result = new Promise((resolve, reject) => {
    esClient.update(payload, (error, response) => {
      if (error) {
        logger.log('elasticsearch-updateData', error, 'error');
        reject(error);
      }
      resolve(response);
    });
  });
  return Promise.resolve(result)
    .then(res => wrapper.data(res))
    .catch(err => wrapper.error(`failed to update data, ${err}`));
};

const findOne = async (config, payload) => {
  const esClient = await conn.getConnection(config);
  const result = new Promise((resolve, reject) => {
    esClient.search(payload, (error, response) => {
      if (error) {
        logger.log('elasticsearch-findOne', error, 'error');
        reject(error);
      }
      resolve(response);
    });
  });
  return Promise.resolve(result)
    .then(res => {
      const data = beutifyResult(res).shift();
      if(validate.isEmpty(data)){
        return wrapper.error('failed to find data');
      }
      return wrapper.data(data);
    }).catch(err => {
      return wrapper.error(`failed to find data, ${err}`);
    });
};

const findAll = async (config, payload) => {
  const esClient = await conn.getConnection(config);
  const result = new Promise((resolve, reject) => {
    esClient.search(payload, (error, response) => {
      if (error) {
        logger.log('elasticsearch-findAll', error, 'error');
        reject(error);
      }
      resolve(response);
    });
  });
  return Promise.resolve(result)
    .then(res => {
      const data = beutifyResult(res);
      if(validate.isEmpty(data)){
        return wrapper.data(data);
      }
      return wrapper.data(data);
    }).catch(err => {
      return wrapper.error(`failed to find data, ${err}`);
    });
};

const insertMany = async (config, payload) => {
  let esClient = await conn.getConnection(config);
  let result = new Promise((resolve, reject) => {
    esClient.bulk(payload, (error, response) => {
      if (error) {
        logger.log('elasticsearch-insertMany', error, 'error');
        reject(error);
      }
      resolve(response);
    });
  });
  return Promise.resolve(result)
    .then(res => wrapper.data(res))
    .catch(err => wrapper.error(`failed to insert all data, ${err}`));
};

const clearScroll = async (config, payload) => {
  let esClient = await conn.getConnection(config);
  let result = new Promise((resolve, reject) => {
    esClient.clearScroll(payload, (error, response) => {
      if (error) {
        logger.log('elasticsearch-clearScroll', error, 'error');
        reject(error);
      }
      resolve(response);
    });
  });
  return Promise.resolve(result)
    .then(res => wrapper.data(res))
    .catch(err => wrapper.error(`failed to scroll data, ${err}`));
};

const sugesters = async (config, payload) => {
  let esClient = await conn.getConnection(config);
  let result = new Promise((resolve, reject) => {
    esClient.search(payload, (error, response) => {
      if (error) {
        logger.log('elasticsearch-sugesters', error, 'error');
        reject(error);
      }
      resolve(response);
    });
  });
  return Promise.resolve(result)
    .then(res => {
      const data = beutifyResult(res);
      return wrapper.data(data);
    }).catch(err => {
      return wrapper.error(`failed to find data, ${err}`);
    });
};

module.exports = {
  createIndex,
  getAllIndex,
  insertData,
  countData,
  deleteData,
  updateData,
  findOne,
  findAll,
  insertMany,
  clearScroll,
  sugesters
};
