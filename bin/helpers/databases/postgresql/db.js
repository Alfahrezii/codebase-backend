
const validate = require('validate.js');

const wrapper = require('../../utils/wrapper');
const pool = require('./connection');
const logger = require('../../utils/logger');

class DB {
  constructor(config) {
    this.config = config;
  }

  async query(statement) {
    let db = await pool.getConnection(this.config);
    if(validate.isEmpty(db)){
      db = await pool.createConnectionPool(this.config);
    }
    const client = await db.connect();
    const recordset = () => {
      return new Promise((resolve, reject) => {
        client.query(statement, (err, res) => {
          if (err) {
            client.release();
            logger.log('db-query', err, 'processing query ...');
            reject(wrapper.error(err.message));
          }
          else {
            client.release();
            const { rows } = res;
            resolve(wrapper.data(rows));
          }
        });
      });
    };
    return recordset().then(res => {
      return res;
    }).catch(err => {
      return err;
    });
  }

  async preparedQuery(statement, parameter) {
    let db = await pool.getConnection(this.config);
    if(validate.isEmpty(db)){
      db = await pool.createConnectionPool(this.config);
    }
    const client = await db.connect();
    const recordset = () => {
      return new Promise((resolve, reject) => {
        client.query(statement, parameter, (err, res) => {
          if (err) {
            client.release();
            logger.log('db-query', err, 'processing query ...');
            reject(wrapper.error(err.message));
          }
          client.release();
          const { rows } = res;
          resolve(wrapper.data(rows));
        });
      });
    };
    return recordset().then(res => {
      return res;
    }).catch(err => {
      return err;
    });
  }

  async command(statement) {
    let db = await pool.getConnection(this.config);
    if(validate.isEmpty(db)){
      db = await pool.createConnectionPool(this.config);
    }
    const client = await db.connect();
    const recordset = async() => {
      try {
        await client.query('BEGIN');
        const res = await db.query(statement);
        await client.query('COMMIT');
        await client.query('COMMIT');
        return wrapper.data(res);
      } catch (err) {
        logger.log('db-command', err, 'processing command ...');
        await client.query('ROLLBACK');
        return wrapper.error(err);
      } finally {
        client.release();
      }
    };
    return recordset().then(res => {
      return res;
    }).catch(err => {
      return err;
    });
  }

  async preparedCommand(statement, parameter) {
    let db = await pool.getConnection(this.config);
    if(validate.isEmpty(db)){
      db = await pool.createConnectionPool(this.config);
    }
    const client = await db.connect();
    const recordset = async() => {
      try {
        await client.query('BEGIN');
        const res = await db.query(statement, parameter);
        await client.query('COMMIT');
        await client.query('COMMIT');
        return wrapper.data(res);
      } catch (err) {
        logger.log('db-command', err, 'processing command ...');
        await client.query('ROLLBACK');
        return wrapper.error(err);
      } finally {
        client.release();
      }
    };
    return recordset().then(res => {
      return res;
    }).catch(err => {
      return err;
    });
  }

}

module.exports = DB;
