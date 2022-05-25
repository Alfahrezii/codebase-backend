
const Query = require('../queries/query');
const Command = require('./command');
const Redis = require('../../../../helpers/databases/redis/redis');
const wrapper = require('../../../../helpers/utils/wrapper');
const jwtAuth = require('../../../../auth/jwt_auth_helper_v2');
const commonUtil = require('../../../../helpers/utils/common');
const mailHandler = require('../../../../helpers/utils/mail_handler');
const common = require('../../utils/common');
const mailTemplate = require('../../utils/mail_template');
const logger = require('../../../../helpers/utils/logger');
const producer = require('../../../../helpers/events/kafka/kafka_producer');
const { NotFoundError, UnauthorizedError, ConflictError, ForbiddenError } = require('../../../../helpers/error');

const config = require('../../../../infra/configs/global_config');
const algorithm = config.get('/cipher/algorithm');
const secretKey = config.get('/cipher/key');

class User {

  constructor(db){
    this.command = new Command(db);
    this.query = new Query(db);
    this.redisClient = new Redis(config.get('/redis'));
  }

  async generateCredential(payload) {
    const ctx = 'domain-generateCredentialV2';
    const filterData = common.filterEmailOrMobileNumber(payload.username);

    const user = await this.query.findOneUser(filterData);
    if (user.err) {
      logger.log(ctx, user.err, 'user not found');
      return wrapper.error(new NotFoundError('user not found'));
    }
    if (!user.data.isConfirmed) {
      const err = new UnauthorizedError('user not confirmed');
      logger.log(ctx, err, err.message);
      return wrapper.error(err);
    }
    const decryptedPassword = await commonUtil.decryptWithIV(user.data.password, algorithm, secretKey);
    if (decryptedPassword !== payload.password) {
      logger.log(ctx, user, 'password invalid!');
      return wrapper.error(new UnauthorizedError('password invalid!'));
    }

    const accessToken = await jwtAuth.generateToken({sub: user.data._id});
    const refreshToken = await jwtAuth.generateRefreshToken({sub: user.data._id});
    await this.redisClient.setDataEx(`refresh-token:${user.data._id}`, refreshToken, 7*24*60*60);

    return wrapper.data({
      accessToken,
      refreshToken
    });
  }

  async deleteCredential(payload) {
    const ctx = 'domain-deleteCredentialV2';
    const checkedToken = await jwtAuth.verifyAccessToken(payload.accessToken);
    if (checkedToken.err){
      logger.log(ctx, checkedToken.err, checkedToken.err.message);
      return wrapper.error(checkedToken.err);
    }
    await this.redisClient.deleteKey(`refresh-token:${checkedToken.data.userId}`);
    await this.redisClient.setDataEx(`blacklist-token:${checkedToken.data.userId}`, checkedToken.data.accessToken, 15*60);

    return wrapper.data('success');
  }

  async registerUser(payload) {
    const ctx = 'domain-registerUserV2';
    const filterData = common.filterEmailOrMobileNumber(payload.username);

    const user = await this.query.findOneUser(filterData);
    if (user.data) {
      logger.log(ctx, user, 'user already exist');
      return wrapper.error(new ConflictError('user already exist'));
    }
    delete payload.username;

    const encryptedPassword = await commonUtil.encryptWithIV(payload.password, algorithm, secretKey);
    const { data: result } = await this.command.insertOneUser({
      ...filterData,
      ...payload,
      password: encryptedPassword,
      isConfirmed: false
    });

    delete result.password;
    delete result.isConfirmed;

    const otp = await commonUtil.getOtp(6);
    if (result.email) {
      producer.kafkaSendProducer({
        topic: 'register-user-by-email',
        attributes: 1,
        body: {
          email: result.email,
          otp: otp
        },
        partition: 1
      });
    } else {
      producer.kafkaSendProducer({
        topic: 'register-user-by-mobile-number',
        attributes: 1,
        body: {
          mobileNumber: result.mobileNumber,
          otp: otp
        },
        partition: 1
      });
    }

    return wrapper.data(result);
  }

  async getRefreshToken(payload) {
    const ctx = 'domain-getRefreshTokenV2';
    const checkedToken = await jwtAuth.verifyRefreshToken(payload.refreshToken);
    if (checkedToken.err){
      logger.log(ctx, checkedToken.err, checkedToken.err.message);
      return wrapper.error(checkedToken.err);
    }
    const accessToken = await jwtAuth.generateToken({sub: checkedToken.data.userId});
    const refreshToken = await jwtAuth.generateRefreshToken({sub: checkedToken.data.userId});
    await this.redisClient.setDataEx(`refresh-token:${checkedToken.data.userId}`, refreshToken, 7*24*60*60);

    return wrapper.data({
      accessToken,
      refreshToken
    });
  }

  async verifyOtp(payload) {
    const ctx = 'domain-verifyOtp';
    const checkedOtp = payload.username.includes('@') ?
      await this.redisClient.getData(`otp-registration:email:${Buffer.from(payload.username).toString('base64')}`) :
      await this.redisClient.getData(`otp-registration:sms:${Buffer.from(payload.username).toString('base64')}`);

    if (checkedOtp.err || !checkedOtp.data) {
      const err = new NotFoundError('user\'s otp not found');
      logger.log(ctx, err, err.message);
      return wrapper.error(err);
    }
    if (JSON.parse(checkedOtp.data).data !== payload.otp) {
      const err = new ConflictError('user\'s otp doesn\'t match');
      logger.log(ctx, err, err.message);
      return wrapper.error(err);
    }

    const filterData = common.filterEmailOrMobileNumber(payload.username);

    const user = await this.query.findOneUser(filterData);
    if (user.err) {
      logger.log(ctx, user.err, 'user not found');
      return wrapper.error(new NotFoundError('user not found'));
    }

    await this.command.upsertOneUser({_id: user.data._id}, {...user.data, isConfirmed: true});
    payload.username.includes('@') ?
      await this.redisClient.deleteKey(`otp-registration:email:${Buffer.from(payload.username).toString('base64')}`) :
      await this.redisClient.deleteKey(`otp-registration:sms:${Buffer.from(payload.username).toString('base64')}`);

    return wrapper.data('success');
  }

  async sendEmailOtp(payload) {
    const { email, otp } = payload;

    await mailHandler.send(
      mailTemplate['emailVerification'](otp),
      email,
      'OTP: For Email Verification'
    );

    this.redisClient.setDataEx(`otp-registration:email:${Buffer.from(email).toString('base64')}`, otp, 60*5);

    return wrapper.data('success');
  }

  async sendSmsOtp(payload) {
    const { mobileNumber, otp } = payload;

    // sending sms otp goes here

    await this.redisClient.setDataEx(`otp-registration:sms:${Buffer.from(mobileNumber).toString('base64')}`, otp, 60*5);

    return wrapper.data('success');
  }
}

module.exports = User;
