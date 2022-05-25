
const User = require('./domain');
const Mongo = require('../../../../helpers/databases/mongodb/db');
const config = require('../../../../infra/configs/global_config');
const db = new Mongo(config.get('/mongoDbUrl'));
const user = new User(db);

const loginUser = async (payload) => {
  const postCommand = (pyld) => user.generateCredential(pyld);
  return postCommand(payload);
};

const logoutUser = async (payload) => {
  const postCommand = (pyld) => user.deleteCredential(pyld);
  return postCommand(payload);
};

const registerUser = async (payload) => {
  const postCommand = (pyld) => user.registerUser(pyld);
  return postCommand(payload);
};

const getRefreshToken = async (payload) => {
  const postCommand = async payload => user.getRefreshToken(payload);
  return postCommand(payload);
};

const verifyOtp = async (payload) => {
  const postCommand = async payload => user.verifyOtp(payload);
  return postCommand(payload);
};

const sendEmailOtp = async (payload) => {
  const postCommand = async (pyld) => user.sendEmailOtp(pyld);
  return postCommand(payload);
};

const sendSmsOtp = async (payload) => {
  const postCommand = async (pyld) => user.sendSmsOtp(pyld);
  return postCommand(payload);
};

module.exports = {
  loginUser,
  logoutUser,
  registerUser,
  getRefreshToken,
  verifyOtp,
  sendEmailOtp,
  sendSmsOtp,
};
