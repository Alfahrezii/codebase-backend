const sinon = require('sinon');
const { expect } = require('chai');
const httpMocks = require('node-mocks-http');
const userHandler = require('../../../../../bin/modules/user-v2/handlers/api_handler');
const queryHandler = require('../../../../../bin/modules/user-v2/repositories/queries/query_handler');
const commandHandler = require('../../../../../bin/modules/user-v2/repositories/commands/command_handler');
const validator = require('../../../../../bin/helpers/utils/validator');

describe('User V2 - Api Handler', () => {

  const req = httpMocks.createRequest({});
  const res = httpMocks.createResponse({});

  const resultSuccess = {
    err: null,
    message: 'success',
    data: [],
    code: 200
  };

  const resultError = {
    err: {}
  };

  beforeEach(() => {
    this.sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    this.sandbox.restore();
  });

  describe('loginUser', () => {

    it('should validator called once', async() => {
      const spyValidator = this.sandbox.spy(validator, 'isValidPayload');
      this.sandbox.stub(commandHandler, 'loginUser').returns(null);

      await userHandler.loginUser(req, res);

      expect(spyValidator.calledOnce).to.be.true;
    });

    it('should not reach command handler when error validation occured', async() => {
      this.sandbox.stub(validator, 'isValidPayload').returns(resultError);
      const spyCommandHandler = this.sandbox.spy(commandHandler, 'loginUser');

      await userHandler.loginUser(req, res);

      expect(spyCommandHandler.calledOnce).to.be.false;
    });

    it('should return error response', async() => {
      this.sandbox.stub(validator, 'isValidPayload').returns(resultSuccess);
      this.sandbox.stub(commandHandler, 'loginUser').returns(resultError);

      await userHandler.loginUser(req, res);

      expect(res.statusCode).to.not.equal(200);
    });

    it('should return success response', async() => {
      this.sandbox.stub(validator, 'isValidPayload').returns(resultSuccess);
      this.sandbox.stub(commandHandler, 'loginUser').returns(resultSuccess);

      await userHandler.loginUser(req, res);

      expect(res.statusCode).to.equal(200);
    });
  });

  describe('logoutUser', () => {

    it('should validator called once', async() => {
      const spyValidator = this.sandbox.spy(validator, 'isValidPayload');
      this.sandbox.stub(commandHandler, 'logoutUser').returns(null);

      await userHandler.logoutUser(req, res);

      expect(spyValidator.calledOnce).to.be.true;
    });

    it('should not reach command handler when error validation occured', async() => {
      this.sandbox.stub(validator, 'isValidPayload').returns(resultError);
      const spyCommandHandler = this.sandbox.spy(commandHandler, 'logoutUser');

      await userHandler.logoutUser(req, res);

      expect(spyCommandHandler.calledOnce).to.be.false;
    });

    it('should return error response', async() => {
      this.sandbox.stub(validator, 'isValidPayload').returns(resultSuccess);
      this.sandbox.stub(commandHandler, 'logoutUser').returns(resultError);

      await userHandler.logoutUser(req, res);

      expect(res.statusCode).to.not.equal(200);
    });

    it('should return success response', async() => {
      this.sandbox.stub(validator, 'isValidPayload').returns(resultSuccess);
      this.sandbox.stub(commandHandler, 'logoutUser').returns(resultSuccess);

      await userHandler.logoutUser(req, res);

      expect(res.statusCode).to.equal(200);
    });
  });

  describe('getRefreshToken', () => {

    it('should validator called once', async() => {
      const spyValidator = this.sandbox.spy(validator, 'isValidPayload');
      this.sandbox.stub(commandHandler, 'getRefreshToken').returns(null);

      await userHandler.getRefreshToken(req, res);

      expect(spyValidator.calledOnce).to.be.true;
    });

    it('should not reach command handler when error validation occured', async() => {
      this.sandbox.stub(validator, 'isValidPayload').returns(resultError);
      const spyCommandHandler = this.sandbox.spy(commandHandler, 'getRefreshToken');

      await userHandler.getRefreshToken(req, res);

      expect(spyCommandHandler.calledOnce).to.be.false;
    });

    it('should return error response', async() => {
      this.sandbox.stub(validator, 'isValidPayload').returns(resultSuccess);
      this.sandbox.stub(commandHandler, 'getRefreshToken').returns(resultError);

      await userHandler.getRefreshToken(req, res);

      expect(res.statusCode).to.not.equal(200);
    });

    it('should return success response', async() => {
      this.sandbox.stub(validator, 'isValidPayload').returns(resultSuccess);
      this.sandbox.stub(commandHandler, 'getRefreshToken').returns(resultSuccess);

      await userHandler.getRefreshToken(req, res);

      expect(res.statusCode).to.equal(200);
    });
  });

  describe('registerUser', () => {

    it('should validator called once', async() => {
      const spyValidator = this.sandbox.spy(validator, 'isValidPayload');
      this.sandbox.stub(commandHandler, 'registerUser').returns(null);

      await userHandler.registerUser(req, res);

      expect(spyValidator.calledOnce).to.be.true;
    });

    it('should not reach command handler when error validation occured', async() => {
      this.sandbox.stub(validator, 'isValidPayload').returns(resultError);
      const spyCommandHandler = this.sandbox.spy(commandHandler, 'registerUser');

      await userHandler.registerUser(req, res);

      expect(spyCommandHandler.calledOnce).to.be.false;
    });

    it('should return error response', async() => {
      this.sandbox.stub(validator, 'isValidPayload').returns(resultSuccess);
      this.sandbox.stub(commandHandler, 'registerUser').returns(resultError);

      await userHandler.registerUser(req, res);

      expect(res.statusCode).to.not.equal(200);
    });

    it('should return success response', async() => {
      this.sandbox.stub(validator, 'isValidPayload').returns(resultSuccess);
      this.sandbox.stub(commandHandler, 'registerUser').returns(resultSuccess);

      await userHandler.registerUser(req, res);

      expect(res.statusCode).to.equal(200);
    });
  });

  describe('verifyOtp', () => {

    it('should validator called once', async() => {
      const spyValidator = this.sandbox.spy(validator, 'isValidPayload');
      this.sandbox.stub(commandHandler, 'verifyOtp').returns(null);

      await userHandler.verifyOtp(req, res);

      expect(spyValidator.calledOnce).to.be.true;
    });

    it('should not reach command handler when error validation occured', async() => {
      this.sandbox.stub(validator, 'isValidPayload').returns(resultError);
      const spyCommandHandler = this.sandbox.spy(commandHandler, 'verifyOtp');

      await userHandler.verifyOtp(req, res);

      expect(spyCommandHandler.calledOnce).to.be.false;
    });

    it('should return error response', async() => {
      this.sandbox.stub(validator, 'isValidPayload').returns(resultSuccess);
      this.sandbox.stub(commandHandler, 'verifyOtp').returns(resultError);

      await userHandler.verifyOtp(req, res);

      expect(res.statusCode).to.not.equal(200);
    });

    it('should return success response', async() => {
      this.sandbox.stub(validator, 'isValidPayload').returns(resultSuccess);
      this.sandbox.stub(commandHandler, 'verifyOtp').returns(resultSuccess);

      await userHandler.verifyOtp(req, res);

      expect(res.statusCode).to.equal(200);
    });
  });

  describe('getUser', () => {

    it('should return error response', async() => {
      this.sandbox.stub(validator, 'isValidPayload').returns(resultSuccess);
      this.sandbox.stub(queryHandler, 'getUser').returns(resultError);

      await userHandler.getUser(req, res);

      expect(res.statusCode).to.not.equal(200);
    });

    it('should return success response', async() => {
      this.sandbox.stub(validator, 'isValidPayload').returns(resultSuccess);
      this.sandbox.stub(queryHandler, 'getUser').returns(resultSuccess);

      await userHandler.getUser(req, res);

      expect(res.statusCode).to.equal(200);
    });
  });
});
