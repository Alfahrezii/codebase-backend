
const wrapper = require('../../../helpers/utils/wrapper');
const commandHandler = require('../repositories/commands/command_handler');
const commandModel = require('../repositories/commands/command_model');
const queryHandler = require('../repositories/queries/query_handler');
const validator = require('../../../helpers/utils/validator');
const { ERROR:httpError, SUCCESS:http } = require('../../../helpers/http-status/status_code');

const postDataLogin = async (req, res) => {
  const payload = req.body;
  const validatePayload = validator.isValidPayload(payload, commandModel.login);
  const postRequest = async (result) => {
    return result.err ? result : commandHandler.postDataLogin(result.data);
  };

  const sendResponse = async (result) => {
    (result.err)
      ? wrapper.response(res, 'fail', result, 'Login User')
      : wrapper.response(res, 'success', result, 'Login User', http.OK);
  };
  sendResponse(await postRequest(validatePayload));
};

const getUser = async (req, res) => {
  const { userId } = req;
  const getData = async () => queryHandler.getUser(userId);
  const sendResponse = async (result) => {
    (result.err)
      ? wrapper.response(res, 'fail', result, 'Get User', httpError.NOT_FOUND)
      : wrapper.response(res, 'success', result, 'Get User', http.OK);
  };
  sendResponse(await getData());
};

const registerUser = async (req, res) => {
  const payload = req.body;
  const validatePayload = validator.isValidPayload(payload, commandModel.login);
  const postRequest = async (result) => {
    return result.err ? result : commandHandler.registerUser(result.data);
  };
  const sendResponse = async (result) => {
    (result.err)
      ? wrapper.response(res, 'fail', result, 'Register User', httpError.CONFLICT)
      : wrapper.response(res, 'success', result, 'Register User', http.OK);
  };
  sendResponse(await postRequest(validatePayload));
};

const getRefreshToken = async (req, res) => {
  const payload = req.body;
  const validatePayload = validator.isValidPayload(payload, commandModel.refreshToken);
  const postRequest = async (result) => {
    return result.err ? result : commandHandler.getRefreshToken(result.data);
  };
  const sendResponse = async (result) => {
    (result.err)
      ? wrapper.response(res, 'fail', result, 'Get Refresh Token', httpError.CONFLICT)
      : wrapper.response(res, 'success', result, 'Get Refresh Token', http.OK);
  };
  sendResponse(await postRequest(validatePayload));
};

module.exports = {
  postDataLogin,
  getUser,
  registerUser,
  getRefreshToken,
};
