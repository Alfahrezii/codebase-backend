const sinon = require('sinon');
const { expect } = require('chai');

const command = require('../../../../../../bin/modules/user-v2/repositories/commands/command');
const query = require('../../../../../../bin/modules/user-v2/repositories/queries/query');
const User = require('../../../../../../bin/modules/user-v2/repositories/commands/domain');
const jwtHelper = require('../../../../../../bin/auth/jwt_auth_helper_v2');
const commonUtil = require('../../../../../../bin/helpers/utils/common');
const mailHandler = require('../../../../../../bin/helpers/utils/mail_handler');
const common = require('../../../../../../bin/modules/user-v2/utils/common');
const Redis = require('../../../../../../bin/helpers/databases/redis/redis');
const kafkaProducer = require('../../../../../../bin/helpers/events/kafka/kafka_producer');
const logger = require('../../../../../../bin/helpers/utils/logger');

describe('User V2 - Domain', () => {

  const queryResult = {
    err: null,
    data: {
      _id: 'some-object-id',
      email: 'sample@email.com',
      isConfirmed: true,
    }
  };

  const queryResultError = {
    err: true,
    data: null
  };

  const db = {
    setCollection: sinon.stub()
  };

  const user = new User(db);

  beforeEach((done) => {
    this.sandbox = sinon.createSandbox();
    this.sandbox.stub(logger, 'error');
    done();
  });

  afterEach((done) => {
    this.sandbox.restore();
    done();
  });

  describe('generateCredential', () => {

    const payload = {
      username: 'some-username',
      password: 'some-password',
    };

    it('should return error user not found', async() => {
      const spyFilterUsername = this.sandbox.spy(common, 'filterEmailOrMobileNumber');
      this.sandbox.stub(query.prototype, 'findOneUser').resolves(queryResultError);

      const res = await user.generateCredential(payload);

      expect(spyFilterUsername.calledOnce).to.be.true;
      expect(res.data).to.equal(null);
      expect(res.err).to.not.equal(null);
    });

    it('should return error user not confirmed', async() => {
      const spyFilterUsername = this.sandbox.spy(common, 'filterEmailOrMobileNumber');
      this.sandbox.stub(query.prototype, 'findOneUser').resolves({
        err: null,
        data: {
          _id: 'some-object-id',
          email: 'sample@email.com',
          isConfirmed: false,
        }
      });

      const res = await user.generateCredential(payload);

      expect(spyFilterUsername.calledOnce).to.be.true;
      expect(res.data).to.equal(null);
      expect(res.err).to.not.equal(null);
    });

    it('should return error password doesn\'t match', async() => {
      const spyFilterUsername = this.sandbox.spy(common, 'filterEmailOrMobileNumber');
      this.sandbox.stub(query.prototype, 'findOneUser').resolves(queryResult);
      this.sandbox.stub(commonUtil, 'decryptWithIV').returns('other-password');

      const res = await user.generateCredential(payload);

      expect(spyFilterUsername.calledOnce).to.be.true;
      expect(res.data).to.equal(null);
      expect(res.err).to.not.equal(null);
    });

    it('should return success', async() => {
      this.sandbox.stub(query.prototype, 'findOneUser').resolves(queryResult);
      this.sandbox.stub(commonUtil, 'decryptWithIV').returns(payload.password);
      const mockGenerateAccessToken = this.sandbox.mock(jwtHelper).expects('generateToken').once().returns(null);
      const mockGenerateRefreshToken = this.sandbox.mock(jwtHelper).expects('generateRefreshToken').once().returns(null);
      const mockRedisClient = this.sandbox.mock(Redis.prototype).expects('setDataEx').once().resolves({err: null});

      const res = await user.generateCredential(payload);

      mockGenerateAccessToken.verify();
      mockGenerateRefreshToken.verify();
      mockRedisClient.verify();
      expect(res.data).to.not.equal(null);
      expect(res.err).to.equal(null);
    });
  });

  describe('deleteCredential', () => {

    const payload = {
      accessToken: 'some-token'
    };

    it('should return error invalid token', async() => {
      const mockVerifyAccessToken = this.sandbox.mock(jwtHelper).expects('verifyAccessToken').once().returns(queryResultError);
      const mockRedisDeleteKey = this.sandbox.mock(Redis.prototype).expects('deleteKey').never();
      const mockRedisSetDataEx = this.sandbox.mock(Redis.prototype).expects('setDataEx').never();

      const res = await user.deleteCredential(payload);

      mockVerifyAccessToken.verify();
      mockRedisDeleteKey.verify();
      mockRedisSetDataEx.verify();
      expect(res.data).to.equal(null);
      expect(res.err).to.not.equal(null);
    });

    it('should return success', async() => {
      const mockVerifyAccessToken = this.sandbox.mock(jwtHelper).expects('verifyAccessToken').once().returns(queryResult);
      const mockRedisDeleteKey = this.sandbox.mock(Redis.prototype).expects('deleteKey').once();
      const mockRedisSetDataEx = this.sandbox.mock(Redis.prototype).expects('setDataEx').once();

      const res = await user.deleteCredential(payload);

      mockVerifyAccessToken.verify();
      mockRedisDeleteKey.verify();
      mockRedisSetDataEx.verify();
      expect(res.data).to.not.equal(null);
      expect(res.err).to.equal(null);
    });
  });

  describe('registerUser', () => {

    const payload = {
      username: 'sample@email.com',
      password: 'some-password',
    };

    it('should return error user already exist', async() => {
      const mockFindOneUser = this.sandbox.mock(query.prototype).expects('findOneUser').once().returns(queryResult);
      const spykEncrypt = this.sandbox.spy(commonUtil, 'encryptWithIV');
      const spyInsertOneUser = this.sandbox.spy(command.prototype, 'insertOneUser');
      const spyGetOtp = this.sandbox.spy(commonUtil, 'getOtp');
      const spyKafkaProducer = this.sandbox.spy(kafkaProducer, 'kafkaSendProducer');

      const res = await user.registerUser(payload);

      mockFindOneUser.verify();
      expect(spykEncrypt.calledOnce).to.be.false;
      expect(spyInsertOneUser.calledOnce).to.be.false;
      expect(spyGetOtp.calledOnce).to.be.false;
      expect(spyKafkaProducer.calledOnce).to.be.false;
      expect(res.data).to.equal(null);
      expect(res.err).to.not.equal(null);
    });

    it('should register using email return success', async() => {
      const mockFindOneUser = this.sandbox.mock(query.prototype).expects('findOneUser').once().returns(queryResultError);
      const mockEncrypt = this.sandbox.mock(commonUtil).expects('encryptWithIV').once().returns('some-encrypted-password');
      const mockInsertOneUser = this.sandbox.mock(command.prototype).expects('insertOneUser').once().resolves(queryResult);
      const spyGetOtp = this.sandbox.spy(commonUtil, 'getOtp');
      const mockKafkaProducer = this.sandbox.mock(kafkaProducer).expects('kafkaSendProducer').once();

      const res = await user.registerUser(payload);

      mockFindOneUser.verify();
      mockEncrypt.verify();
      mockInsertOneUser.verify();
      expect(spyGetOtp.calledOnce).to.be.true;
      mockKafkaProducer.verify();
      expect(res.data).to.not.equal(null);
      expect(res.data).to.has.not.own.property('password');
      expect(res.data).to.has.not.own.property('isConfirmed');
      expect(res.err).to.equal(null);
    });

    it('should register using mobile number return success', async() => {
      const mockFindOneUser = this.sandbox.mock(query.prototype).expects('findOneUser').once().returns(queryResultError);
      const mockEncrypt = this.sandbox.mock(commonUtil).expects('encryptWithIV').once().returns('some-encrypted-password');
      const mockInsertOneUser = this.sandbox.mock(command.prototype).expects('insertOneUser').once().resolves({
        err: null,
        data: {
          _id: 'some-object-id',
          mobileNumber: '+628123456789',
        }
      });
      const spyGetOtp = this.sandbox.spy(commonUtil, 'getOtp');
      const mockKafkaProducer = this.sandbox.mock(kafkaProducer).expects('kafkaSendProducer').once();

      const res = await user.registerUser({
        username: '+628123456789',
        password: 'sample-password'
      });

      mockFindOneUser.verify();
      mockEncrypt.verify();
      mockInsertOneUser.verify();
      expect(spyGetOtp.calledOnce).to.be.true;
      mockKafkaProducer.verify();
      expect(res.data).to.not.equal(null);
      expect(res.data).to.has.not.own.property('password');
      expect(res.data).to.has.not.own.property('isConfirmed');
      expect(res.err).to.equal(null);
    });
  });

  describe('getRefreshToken', () => {

    const payload = {
      refreshToken: 'current-refresh-token',
    };

    it('should return error invalid token', async() => {
      const mockVerifyRefreshToken = this.sandbox.mock(jwtHelper).expects('verifyRefreshToken').once().returns(queryResultError);
      const spyGenerateToken = this.sandbox.spy(jwtHelper, 'generateToken');
      const spyGenerateRefreshToken = this.sandbox.spy(jwtHelper, 'generateRefreshToken');
      const spyRedisSetDataEx = this.sandbox.spy(Redis.prototype, 'setDataEx');

      const res = await user.getRefreshToken(payload);

      mockVerifyRefreshToken.verify();
      expect(spyGenerateToken.calledOnce).to.be.false;
      expect(spyGenerateRefreshToken.calledOnce).to.be.false;
      expect(spyRedisSetDataEx.calledOnce).to.be.false;
      expect(res.data).to.equal(null);
      expect(res.err).to.not.equal(null);
    });

    it('should return success', async() => {
      const mockVerifyRefreshToken = this.sandbox.mock(jwtHelper).expects('verifyRefreshToken').once().returns(queryResult);
      const mockGenerateToken = this.sandbox.mock(jwtHelper).expects('generateToken').once().returns('new-access-token');
      const mockGenerateRefreshToken = this.sandbox.mock(jwtHelper).expects('generateRefreshToken').once().returns('new-refresh-token');
      const spyRedisSetDataEx = this.sandbox.spy(Redis.prototype, 'setDataEx');

      const res = await user.getRefreshToken(payload);

      mockVerifyRefreshToken.verify();
      mockGenerateToken.verify();
      mockGenerateRefreshToken.verify();
      expect(spyRedisSetDataEx.calledOnce).to.be.true;
      expect(res.data).to.not.equal(null);
      expect(res.err).to.equal(null);
    });
  });

  describe('verifyOtp', () => {

    const payload = {
      username: 'sample@email.com',
      otp: '123456',
    };

    it('should return error otp not found', async() => {
      const mockRedisSetDataEx = this.sandbox.mock(Redis.prototype).expects('getData').once().returns({err: new Error()});

      const res = await user.verifyOtp(payload);

      mockRedisSetDataEx.verify();
      expect(res.data).to.equal(null);
      expect(res.err).to.not.equal(null);
    });

    it('should return error otp not match', async() => {
      const mockRedisSetDataEx = this.sandbox.mock(Redis.prototype).expects('getData').once().returns({
        data: JSON.stringify({data: '654321'})
      });

      const res = await user.verifyOtp(payload);

      mockRedisSetDataEx.verify();
      expect(res.data).to.equal(null);
      expect(res.err).to.not.equal(null);
    });

    it('should return error user not found', async() => {
      const mockRedisSetDataEx = this.sandbox.mock(Redis.prototype).expects('getData').once().returns({
        data: JSON.stringify({data: '123456'})
      });
      const spyFilterUsername = this.sandbox.spy(common, 'filterEmailOrMobileNumber');
      this.sandbox.stub(query.prototype, 'findOneUser').resolves(queryResultError);

      const res = await user.verifyOtp(payload);

      mockRedisSetDataEx.verify();
      expect(spyFilterUsername.calledOnce).to.be.true;
      expect(res.data).to.equal(null);
      expect(res.err).to.not.equal(null);
    });

    it('should verify with email return success', async() => {
      const mockRedisSetDataEx = this.sandbox.mock(Redis.prototype).expects('getData').once().returns({
        data: JSON.stringify({data: '123456'})
      });
      const spyFilterUsername = this.sandbox.spy(common, 'filterEmailOrMobileNumber');
      this.sandbox.stub(query.prototype, 'findOneUser').resolves(queryResult);
      this.sandbox.stub(command.prototype, 'upsertOneUser').resolves({
        ...queryResult,
        isConfirmed: true
      });
      const mockRedisDeleteKey = this.sandbox.mock(Redis.prototype).expects('deleteKey').once();

      const res = await user.verifyOtp(payload);

      mockRedisSetDataEx.verify();
      expect(spyFilterUsername.calledOnce).to.be.true;
      mockRedisDeleteKey.verify();
      expect(res.data).to.not.equal(null);
      expect(res.data).to.has.not.own.property('password');
      expect(res.data).to.has.not.own.property('isConfirmed');
      expect(res.err).to.equal(null);
    });

    it('should verify with mobile number return success', async() => {
      const mockRedisSetDataEx = this.sandbox.mock(Redis.prototype).expects('getData').once().returns({
        data: JSON.stringify({data: '123456'})
      });
      const spyFilterUsername = this.sandbox.spy(common, 'filterEmailOrMobileNumber');
      this.sandbox.stub(query.prototype, 'findOneUser').resolves(queryResult);
      this.sandbox.stub(command.prototype, 'upsertOneUser').resolves({
        ...queryResult,
        isConfirmed: true
      });
      const mockRedisDeleteKey = this.sandbox.mock(Redis.prototype).expects('deleteKey').once();

      const res = await user.verifyOtp({
        username: '+628123456789',
        otp: '123456',
      });

      mockRedisSetDataEx.verify();
      expect(spyFilterUsername.calledOnce).to.be.true;
      mockRedisDeleteKey.verify();
      expect(res.data).to.not.equal(null);
      expect(res.data).to.has.not.own.property('password');
      expect(res.data).to.has.not.own.property('isConfirmed');
      expect(res.err).to.equal(null);
    });
  });

  describe('sendEmailOtp', () => {

    const payload = {
      email: 'sample@email.com',
      otp: '123456',
    };

    it('should return success', async() => {
      this.sandbox.stub(mailHandler, 'send');
      const mockRedisSetKey = this.sandbox.mock(Redis.prototype).expects('setDataEx').once();

      const res = await user.sendEmailOtp(payload);

      mockRedisSetKey.verify();
      expect(res.data).to.not.equal(null);
      expect(res.err).to.equal(null);
    });
  });

  describe('sendSmsOtp', () => {

    const payload = {
      mobileNumber: '+628123456789',
      otp: '123456',
    };

    it('should return success', async() => {
      const mockRedisSetKey = this.sandbox.mock(Redis.prototype).expects('setDataEx').once();

      const res = await user.sendSmsOtp(payload);

      mockRedisSetKey.verify();
      expect(res.data).to.not.equal(null);
      expect(res.err).to.equal(null);
    });
  });
});
