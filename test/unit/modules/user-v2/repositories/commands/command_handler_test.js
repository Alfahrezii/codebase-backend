const commandHandler = require('../../../../../../bin/modules/user-v2/repositories/commands/command_handler');
const User = require('../../../../../../bin/modules/user-v2/repositories/commands/domain');
const sinon = require('sinon');
const { expect } = require('chai');

describe('User V2 - Command Handler', () => {

  const resultSucces = {
    err: null,
    message: 'success',
    data: [],
    code: 200
  };

  describe('loginUser', () => {

    it('should return success', async() => {
      sinon.stub(User.prototype, 'generateCredential').resolves(resultSucces);

      const res = await commandHandler.loginUser({});

      expect(res.data).to.not.equal(null);

      User.prototype.generateCredential.restore();
    });
  });

  describe('registerUser', () => {

    it('should info success', async() => {
      sinon.stub(User.prototype, 'registerUser').resolves(resultSucces);

      const res = await commandHandler.registerUser({});

      expect(res.data).to.not.equal(null);

      User.prototype.registerUser.restore();
    });
  });

  describe('getRefreshToken', () => {

    it('should info success', async() => {
      sinon.stub(User.prototype, 'getRefreshToken').resolves(resultSucces);

      const res = await commandHandler.getRefreshToken({});

      expect(res.data).to.not.equal(null);

      User.prototype.getRefreshToken.restore();
    });
  });

  describe('logoutUser', () => {

    it('should info success', async() => {
      sinon.stub(User.prototype, 'deleteCredential').resolves(resultSucces);

      const res = await commandHandler.logoutUser({});

      expect(res.data).to.not.equal(null);

      User.prototype.deleteCredential.restore();
    });
  });

  describe('verifyOtp', () => {

    it('should info success', async() => {
      sinon.stub(User.prototype, 'verifyOtp').resolves(resultSucces);

      const res = await commandHandler.verifyOtp({});

      expect(res.data).to.not.equal(null);

      User.prototype.verifyOtp.restore();
    });
  });

  describe('sendEmailOtp', () => {

    it('should info success', async() => {
      sinon.stub(User.prototype, 'sendEmailOtp').resolves(resultSucces);

      const res = await commandHandler.sendEmailOtp({});

      expect(res.data).to.not.equal(null);

      User.prototype.sendEmailOtp.restore();
    });
  });

  describe('sendSmsOtp', () => {

    it('should info success', async() => {
      sinon.stub(User.prototype, 'sendSmsOtp').resolves(resultSucces);

      const res = await commandHandler.sendSmsOtp({});

      expect(res.data).to.not.equal(null);

      User.prototype.sendSmsOtp.restore();
    });
  });
});
