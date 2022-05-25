
const jwt = require('jsonwebtoken');
const validate = require('validate.js');
const config = require('../infra/configs/global_config');
const queryUser = require('../modules/user/repositories/queries/query_handler');
const wrapper = require('../helpers/utils/wrapper');
const { ERROR } = require('../helpers/http-status/status_code');
const { UnauthorizedError, ForbiddenError } = require('../helpers/error');

const decodeKey = (secret) => Buffer.from(secret, 'base64');

const Redis = require('../helpers/databases/redis/redis');
const redisClient = new Redis(config.get('/redis'));

const generateToken = async (payload) => {
  const privateKey = decodeKey(config.get('/jwt/privateKey'));
  return jwt.sign(payload, privateKey, config.get('/jwt/signOptions'));
};

const generateRefreshToken = async (payload) => {
  const privateKey = decodeKey(config.get('/jwt/refresh/privateKey'));
  const token = jwt.sign(payload, privateKey, config.get('/jwt/refresh/signOptions'));
  return token;
};

const getToken = (headers) => {
  if (headers && headers.authorization && headers.authorization.includes('Bearer')) {
    const parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    }
  }
  return undefined;
};

const getUser = async (userId) => {

  const userFlag = await redisClient.getData(`user-profile:${userId}`);
  if (validate.isEmpty(userFlag.data)) {
    const user = await queryUser.getUser(userId);
    if (user.data) {
      await redisClient.setDataEx(`user-profile:${userId}`, user, 10 * 60);
    }
    return user;
  }

  return JSON.parse(userFlag.data).data;
};

const verifyToken = async (req, res, next) => {
  const result = {
    err: null,
    data: null
  };

  const token = getToken(req.headers);
  if (!token) {
    result.err = new ForbiddenError('Invalid token!');
    return wrapper.response(res, 'fail', result, 'Invalid token!', ERROR.FORBIDDEN);
  }
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, decodeKey(config.get('/jwt/publicKey')), config.get('/jwt/verifyOptions'));
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      result.err = new UnauthorizedError('Access token expired!');
      return wrapper.response(res, 'fail', result, 'Access token expired!', ERROR.UNAUTHORIZED);
    }
    result.err = new UnauthorizedError('Token is not valid!');
    return wrapper.response(res, 'fail', result, 'Token is not valid!', ERROR.UNAUTHORIZED);
  }
  const userId = decodedToken.sub;
  const user = await getUser(userId);
  if (user.err) {
    result.err = new ForbiddenError('Invalid token!');
    return wrapper.response(res, 'fail', result, 'Invalid token!', ERROR.FORBIDDEN);
  }
  req.userId = userId;
  next();
};

const verifyRefreshToken = async (token) => {
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, decodeKey(config.get('/jwt/refresh/publicKey')), config.get('/jwt/verifyOptions'));
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return wrapper.error(new UnauthorizedError('Access token expired!'));
    }
    return wrapper.error(new UnauthorizedError('Token is not valid!'));
  }

  const userId = decodedToken.sub;
  const user = await getUser(userId);
  if (user.err) {
    return wrapper.error(new UnauthorizedError('Invalid Token'));
  }
  return wrapper.data({userId: userId});
};

module.exports = {
  generateToken,
  verifyToken,
  generateRefreshToken,
  verifyRefreshToken,
};
