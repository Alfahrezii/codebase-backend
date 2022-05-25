const sinon = require('sinon');
const jwt = require('jsonwebtoken');

const jwtHelper = require('../../../bin/auth/jwt_auth_helper');
const queryUser = require('../../../bin/modules/user/repositories/queries/query_handler');

const Redis = require('../../../bin/helpers/databases/redis/redis');

describe('Json Web Token', () => {

  let decodedToken = {
    'username': 'alifsn',
    'sub': '5bac53b45ea76b1e9bd58e1c',
    'iat': 1540469257,
    'exp': 1540475257,
    'aud': '97b33193-43ff-4e58-9124-b3a9b9f72c34',
    'iss': 'telkomdev'
  };

  beforeEach(() => {
    sinon.stub(jwt, 'sign');
    this.stubRedisClient = sinon.stub(Redis.prototype, 'getData');
  });

  afterEach(() => {
    jwt.sign.restore();
    this.stubRedisClient.restore();
  });

  describe('generateToken', () => {
    it('should success generate token', async() => {
      await jwtHelper.generateToken({});
    });
  });

  describe('generateRefreshToken', () => {
    it('should success generate refresh token', async() => {
      await jwtHelper.generateRefreshToken({});
    });
  });

  describe('verifyToken', () => {
    it('should return error invalid token', async() => {
      const req = {
        headers: {
          authorization: 'Bearer 12345'
        }
      };
      const res = {
        send: sinon.stub()
      };
      const next = sinon.stub();
      await jwtHelper.verifyToken(req, res, next);
    });
    it('should return error expired token', async() => {
      const req = {
        headers: {
          authorization: 'Bearer 12345'
        }
      };
      const res = {
        send: sinon.stub()
      };
      const next = sinon.stub();
      this.stubRedisClient.returns({err: new Error('error')});
      sinon.stub(queryUser, 'getUser').returns({err: new Error('error')});
      sinon.stub(jwt, 'verify').returns(new jwt.TokenExpiredError('error', new Date()));
      await jwtHelper.verifyToken(req, res, next);
      queryUser.getUser.restore();
      jwt.verify.restore();
    });
    it('should return error user', async() => {
      const req = {
        headers: {
          authorization: 'Bearer 12345'
        }
      };
      const res = {
        send: sinon.stub()
      };
      const next = sinon.stub();
      this.stubRedisClient.returns({err: new Error('error')});
      sinon.stub(jwt, 'verify').resolves(decodedToken);
      sinon.stub(queryUser, 'getUser').returns({err: new Error('error')});
      await jwtHelper.verifyToken(req, res, next);
      queryUser.getUser.restore();
      jwt.verify.restore();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should return error invalid token', async() => {
      const token = '12345';
      await jwtHelper.verifyRefreshToken(token);
    });
    it('should return error expired token', async() => {
      const token = '12345';
      this.stubRedisClient.returns({err: new Error('error')});
      sinon.stub(queryUser, 'getUser').returns({err: new Error('error')});
      sinon.stub(jwt, 'verify').returns(new jwt.TokenExpiredError('error', new Date()));
      await jwtHelper.verifyRefreshToken(token);
      queryUser.getUser.restore();
      jwt.verify.restore();
    });
    it('should return error user', async() => {
      const token = '12345';
      sinon.stub(jwt, 'verify').resolves(decodedToken);
      this.stubRedisClient.returns({err: new Error('error')});
      sinon.stub(queryUser, 'getUser').returns({err: new Error('error')});
      await jwtHelper.verifyRefreshToken(token);
      queryUser.getUser.restore();
      jwt.verify.restore();
    });
  });
});
