const sinon = require('sinon');
const { expect } = require('chai');
const jwt = require('jsonwebtoken');
const httpMocks = require('node-mocks-http');

const jwtHelper = require('../../../bin/auth/jwt_auth_helper_v2');
const redis = require('../../../bin/helpers/databases/redis/redis');
const { UnauthorizedError, NotFoundError } = require('../../../bin/helpers/error');

describe('JWT Auth Helper V2', () => {

  describe('generateTokenV2', () => {
    beforeEach(() => {
      this.payload = {
        sub: 'some-object-id',
      };
      this.expectedToken = 'encoded-token';
      this.mockedJwt = sinon.mock(jwt);
      this.mockedJwt.expects('sign').once().resolves(this.expectedToken);
    });

    afterEach(() => {
      this.mockedJwt.verify();
      this.mockedJwt.restore();
    });

    it('should success generate access token', async() => {
      expect(await jwtHelper.generateToken(this.payload)).to.equal(this.expectedToken);
    });
  });

  describe('generateRefreshTokenV2', () => {
    beforeEach(() => {
      this.payload = {
        sub: 'some-object-id',
      };
      this.expectedToken = 'encoded-token';
      this.mockedJwt = sinon.mock(jwt);
      this.mockedJwt.expects('sign').once().resolves(this.expectedToken);
    });

    afterEach(() => {
      this.mockedJwt.verify();
      this.mockedJwt.restore();
    });

    it('should success generate refresh token', async() => {
      expect(await jwtHelper.generateRefreshToken(this.payload)).to.equal(this.expectedToken);
    });
  });

  describe('verifyTokenV2', () => {

    const payload = {
      sub: 'some-object-id',
    };

    const accessTokenExpiratedIn = 15 * 60 * 1000 + 1;

    const invalidAccessTokenRes = {
      success: false,
      data: '',
      message: 'Invalid token!' ,
      code: 403,
    };

    const expiredAccessTokenRes = {
      success: false,
      data: '',
      message: 'Access token expired!' ,
      code: 401,
    };

    const blacklistedAccessTokenRes = {
      success: false,
      data: '',
      message: 'Blacklisted token!' ,
      code: 403,
    };

    const verifiedAccessTokenRes = payload.sub;

    before(async () => {
      this.payload = payload;
      this.encodedToken = await jwtHelper.generateToken(this.payload);
    });

    it('should return error invalid access token', async() => {
      const req = httpMocks.createRequest({});
      const res = httpMocks.createResponse({});
      const next = sinon.stub();
      await jwtHelper.verifyToken(req, res, next);
      expect(res._getData()).to.deep.equal(invalidAccessTokenRes);
    });

    it('should return error expired access token', async() => {
      const req = httpMocks.createRequest({
        headers: {
          authorization: `Bearer ${this.encodedToken}`
        }
      });
      const res = httpMocks.createResponse();
      const next = sinon.stub();
      const clock = sinon.useFakeTimers(Date.now());
      clock.tick(accessTokenExpiratedIn); // skip time ahead of expiration of token
      await jwtHelper.verifyToken(req, res, next);
      expect(res._getData()).to.deep.equal(expiredAccessTokenRes);
      clock.restore();
    });

    it('should return error blacklisted token', async() => {
      const req = httpMocks.createRequest({
        headers: {
          authorization: `Bearer ${this.encodedToken}`
        }
      });
      const res = httpMocks.createResponse();
      const next = sinon.stub();
      sinon.stub(redis.prototype, 'getData').returns({
        data: JSON.stringify({data: this.encodedToken})
      });
      await jwtHelper.verifyToken(req, res, next);
      expect(res._getData()).to.deep.equal(blacklistedAccessTokenRes);
      redis.prototype.getData.restore();
    });

    it('should success extract user data', async() => {
      const req = httpMocks.createRequest({
        headers: {
          authorization: `Bearer ${this.encodedToken}`
        }
      });
      const res = httpMocks.createResponse();
      const next = sinon.stub();
      sinon.stub(redis.prototype, 'getData').returns({
        err: new Error(),
      });
      await jwtHelper.verifyToken(req, res, next);
      expect(req.userId).to.equal(verifiedAccessTokenRes);
      redis.prototype.getData.restore();
    });
  });

  describe('verifyRefreshTokenV2', () => {

    const payload = {
      sub: 'some-object-id',
    };

    const refreshTokenExpiratedIn = 7 * 24 * 60 * 60 * 1000 + 1;

    const invalidRefreshTokenRes = {
      data: null,
      err: new NotFoundError('Token is not valid!'),
    };

    const expiredRefreshTokenRes = {
      data: null,
      err: new UnauthorizedError('Refresh token expired!'),
    };

    const refreshTokenNotInRedisRes = {
      data: null,
      err: new NotFoundError('refresh token not found'),
    };

    const verifiedRefreshTokenRes = {
      userId: payload.sub
    };

    before(async () => {
      this.payload = payload;
      this.encodedToken = await jwtHelper.generateRefreshToken(this.payload);
    });

    it('should return error invalid refresh token', async() => {
      const result = await jwtHelper.verifyRefreshToken('');
      expect(result).to.deep.equal(invalidRefreshTokenRes);
    });

    it('should return error expired refresh token', async() => {
      const clock = sinon.useFakeTimers(Date.now());
      clock.tick(refreshTokenExpiratedIn); // skip time ahead of expiration of token
      const result = await jwtHelper.verifyRefreshToken(this.encodedToken);
      expect(result).to.deep.equal(expiredRefreshTokenRes);
      clock.restore();
    });

    it('should return error provided refresh token not found in redis', async() => {
      sinon.stub(redis.prototype, 'getData').returns({
        err: new Error(),
      });
      const result = await jwtHelper.verifyRefreshToken(this.encodedToken);
      expect(result).to.deep.equal(refreshTokenNotInRedisRes);
      redis.prototype.getData.restore();
    });

    it('should success extract user data', async() => {
      sinon.stub(redis.prototype, 'getData').returns({
        data: JSON.stringify({data: this.encodedToken}),
      });
      const result = await jwtHelper.verifyRefreshToken(this.encodedToken);
      expect(result.data).to.deep.equal(verifiedRefreshTokenRes);
      redis.prototype.getData.restore();
    });
  });
});
