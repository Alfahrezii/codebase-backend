
const Postgre = require('pg');

let connectionPool = [];

const createConnectionPool = async (config) => {
  const currConnection = connectionPool.findIndex(conf => conf.config.toString() === config.toString());
  let db;
  if(currConnection === -1){
    db = new Postgre.Pool(config);
    connectionPool.push({
      config,
      connection: db
    });
  }
  return db;
};

const getConnection = async (config) => {
  const currConnection = connectionPool.filter(conf => conf.config.toString() === config.toString());
  let conn;
  currConnection.some((obj,i) => {
    if(i === 0){
      const { connection } = obj;
      conn = connection;
      return true;
    }
  });
  return conn;
};

module.exports = {
  createConnectionPool,
  getConnection
};
