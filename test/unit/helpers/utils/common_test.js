const { expect } = require('chai');
const sinon = require('sinon');

const crypto = require('crypto');
const commonUtil = require('../../../../bin/helpers/utils/common');

describe('Common', () => {

  const cipherAlgorithm = 'aes-256-cbc';
  const secretKey = crypto.randomBytes(32);
  const ivKey = crypto.randomBytes(16);
  const samplePassword = 'some-password';
  let encryptedPassword = '';

  describe('getLastFromURL', () => {
    it('should return succes', async() => {
      const res = await commonUtil.getLastFromURL('http://localhost:9000/dev');
      expect(res).to.equal('dev');
    });
  });

  describe('encrypt', () => {
    it('should return succes', async() => {
      sinon.stub(crypto, 'randomBytes').returns(ivKey);
      const res = await commonUtil.encrypt(samplePassword, cipherAlgorithm, secretKey);
      encryptedPassword = res;
      crypto.randomBytes.restore();
    });
  });

  describe('decrypt', () => {
    it('should return succes', async() => {
      const res = await commonUtil.decrypt(encryptedPassword, cipherAlgorithm, secretKey);
      expect(res).to.equal(samplePassword);
    });
  });

  describe('encryptWithIV', () => {
    it('should return succes', async() => {
      sinon.stub(crypto, 'randomBytes').returns(ivKey);
      const res = await commonUtil.encryptWithIV(samplePassword, cipherAlgorithm, secretKey);
      encryptedPassword = res;
      const encryptedArray = res.split(':');
      expect(encryptedArray).to.have.length(2);
      expect(encryptedArray[0]).to.equal(ivKey.toString('hex'));
      crypto.randomBytes.restore();
    });
  });

  describe('decryptWithIV', () => {
    it('should return succes', async() => {
      const res = await commonUtil.decryptWithIV(encryptedPassword, cipherAlgorithm, secretKey);
      expect(res).to.equal(samplePassword);
    });
  });

  describe('getOtp', () => {
    it('should return succes', async() => {
      const res = await commonUtil.getOtp(6);
      expect(res).to.have.length(6);
    });
  });
});

