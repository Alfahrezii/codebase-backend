
const Query = require('../queries/query');
const Command = require('./command');
const wrapper = require('../../../../helpers/utils/wrapper');
const jwtAuth = require('../../../../auth/jwt_auth_helper');
const commonUtil = require('../../../../helpers/utils/common');
const logger = require('../../../../helpers/utils/logger');
const { NotFoundError, UnauthorizedError, ConflictError, ForbiddenError } = require('../../../../helpers/error');

const config = require('../../../../infra/configs/global_config');
const algorithm = config.get('/cipher/algorithm');
const secretKey = config.get('/cipher/key');

class User {

  constructor(db){
    this.command = new Command(db);
    this.query = new Query(db);
  }

  async generateCredential(payload) {
    const ctx = 'domain-generateCredential';
    const { username, password } = payload;
    const user = await this.query.findOneUser({ username });
    if (user.err) {
      logger.log(ctx, user.err, 'user not found');
      return wrapper.error(new NotFoundError('user not found'));
    }
    const userId = user.data._id;
    const userName = user.data.username;
    const pass = await commonUtil.decrypt(user.data.password, algorithm, secretKey);
    if (username !== userName || pass !== password) {
      return wrapper.error(new UnauthorizedError('Password invalid!'));
    }
    const data = {
      username,
      sub: userId
    };
    const token = await jwtAuth.generateToken(data);
    const refreshToken = await jwtAuth.generateRefreshToken(data);
    return wrapper.data({
      token,
      refreshToken,
    });
  }

  async register(payload) {
    const { username, password, isActive } = payload;
    const user = await this.query.findOneUser({ username });

    if (user.data) {
      return wrapper.error(new ConflictError('user already exist'));
    }

    const chiperPwd = await commonUtil.encrypt(password, algorithm, secretKey);
    const data = {
      username,
      password: chiperPwd,
      isActive
    };

    const { data:result } = await this.command.insertOneUser(data);
    delete result.password;
    return wrapper.data(result);

  }

  async getRefreshToken(payload) {
    const ctx = 'domain-getRefreshToken';
    const checkedToken = await jwtAuth.verifyRefreshToken(payload.refreshToken);
    if (checkedToken.err){
      logger.log(ctx, checkedToken.err, 'Token is not valid');
      return wrapper.error(new ForbiddenError('Token is not valid'));
    }
    const token = await jwtAuth.generateToken({userId: checkedToken.data.userId});
    const refreshToken = await jwtAuth.generateRefreshToken({userId: checkedToken.data.userId});
    return wrapper.data({
      token: token,
      refreshToken: refreshToken
    });
  }

}

module.exports = User;
