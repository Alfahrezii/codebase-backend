
const User = require('./domain');
const Mongo = require('../../../../helpers/databases/mongodb/db');
const config = require('../../../../infra/configs/global_config');
const db = new Mongo(config.get('/mongoDbUrl'));
const user = new User(db);

const postDataLogin = async (payload) => {
  const postCommand = (pyld) => user.generateCredential(pyld);
  return postCommand(payload);
};

const registerUser = async (payload) => {
  const postCommand = (pyld) => user.register(pyld);
  return postCommand(payload);
};

const getRefreshToken = async (payload) => {
  const postCommand = (pyld) => user.getRefreshToken(pyld);
  return postCommand(payload);
};

module.exports = {
  postDataLogin,
  registerUser,
  getRefreshToken,
};
