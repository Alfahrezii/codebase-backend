const sinon = require('sinon');
const { expect } = require('chai');
const redis = require('redis');

const rewire = require('rewire');
const redisDb = rewire('../../../../../bin/helpers/databases/redis/connection');
const Redis = require('../../../../../bin/helpers/databases/redis/redis');
const logger = require('../../../../../bin/helpers/utils/logger');

const redisHelper = new Redis({});

describe('Redis', () => {

  const redisClient = {
    'on': () => sinon.stub(),
    'select': () => sinon.stub(),
    'set': () => sinon.stub(),
    'get': () => sinon.stub(),
    'keys': () => sinon.stub(),
    'del': () => sinon.stub(),
    'incr': () => sinon.stub(),
    'multi': () => sinon.stub(),
    'expire': () => sinon.stub(),
    'exec': () => sinon.stub(),
  };

  beforeEach(async () => {
    this.sandbox = sinon.createSandbox();
    this.sandbox.stub(redis, 'createClient').callsFake(() => redisClient);
    const createConnectionPool = redisDb.__get__('createConnectionPool');
    await createConnectionPool({});
  });

  afterEach(async () => {
    redisDb.__set__('connectionPool', []);
    this.sandbox.restore();
  });

  describe('selectDb', () => {

    it('should logging when client on error', async () => {
      const mockOnClient = this.sandbox.mock(redisClient).expects('on').yields({});
      const spyLoggerLog = this.sandbox.spy(logger, 'log');
      const mockSelectClient = this.sandbox.mock(redisClient).expects('select').once().yields({});

      await redisHelper.selectDb(0);

      mockOnClient.verify();
      expect(spyLoggerLog.calledOnce).to.be.true;
      mockSelectClient.verify();
    });

    it('should cover error', async () => {
      const spyOnClient = this.sandbox.spy(redisClient, 'on');
      const mockSelectClient = this.sandbox.mock(redisClient).expects('select').once().yields({});

      await redisHelper.selectDb(0);

      expect(spyOnClient.calledOnce).to.be.true;
      mockSelectClient.verify();
    });

    it('should create connection when client not established', async () => {
      const spyOnClient = this.sandbox.spy(redisClient, 'on');
      const mockSelectClient = this.sandbox.mock(redisClient).expects('select').once().yields(null);

      await redisHelper.selectDb(0);

      expect(spyOnClient.calledOnce).to.be.true;
      mockSelectClient.verify();
    });
  });

  describe('setData', () => {

    it('should logging when client on error', async () => {
      const mockOnClient = this.sandbox.mock(redisClient).expects('on').yields({});
      const spyLoggerLog = this.sandbox.spy(logger, 'log');
      const mockSelectClient = this.sandbox.mock(redisClient).expects('select').once().yields({});
      const spySetClient = this.sandbox.spy(redisClient, 'set');

      await redisHelper.setData('some-key', 'some-value');

      mockOnClient.verify();
      expect(spyLoggerLog.calledTwice).to.be.true;
      mockSelectClient.verify();
      expect(spySetClient.calledOnce).to.be.false;
    });

    it('should cover error', async () => {
      const spyOnClient = this.sandbox.spy(redisClient, 'on');
      const mockSelectClient = this.sandbox.mock(redisClient).expects('select').once().yields({});
      const spyLoggerLog = this.sandbox.spy(logger, 'log');
      const spySetClient = this.sandbox.spy(redisClient, 'set');

      await redisHelper.setData('some-key', 'some-value');

      expect(spyOnClient.calledOnce).to.be.true;
      mockSelectClient.verify();
      expect(spyLoggerLog.calledOnce).to.be.true;
      expect(spySetClient.calledOnce).to.be.false;
    });

    it('should create connection when client not established', async () => {
      const spyOnClient = this.sandbox.spy(redisClient, 'on');
      const mockSelectClient = this.sandbox.mock(redisClient).expects('select').once().yields(null);
      const spySetClient = this.sandbox.spy(redisClient, 'set');

      await redisHelper.setData('some-key', 'some-value');

      expect(spyOnClient.calledOnce).to.be.true;
      mockSelectClient.verify();
      expect(spySetClient.calledOnce).to.be.true;
    });
  });

  describe('setDataEx', () => {

    it('should logging when client on error', async () => {
      const mockOnClient = this.sandbox.mock(redisClient).expects('on').yields({});
      const mockSelectClient = this.sandbox.mock(redisClient).expects('select').once().yields({});
      const spyLoggerLog = this.sandbox.spy(logger, 'log');
      const spySetClient = this.sandbox.spy(redisClient, 'set');

      await redisHelper.setDataEx('some-key', 'some-value');

      mockOnClient.verify();
      mockSelectClient.verify();
      expect(spyLoggerLog.calledTwice).to.be.true;
      expect(spySetClient.calledOnce).to.be.false;
    });

    it('should cover error', async () => {
      const spyOnClient = this.sandbox.spy(redisClient, 'on');
      const mockSelectClient = this.sandbox.mock(redisClient).expects('select').once().yields({});
      const spyLoggerLog = this.sandbox.spy(logger, 'log');
      const spySetClient = this.sandbox.spy(redisClient, 'set');

      await redisHelper.setDataEx('some-key', 'some-value');

      expect(spyOnClient.calledOnce).to.be.true;
      mockSelectClient.verify();
      expect(spyLoggerLog.calledOnce).to.be.true;
      expect(spySetClient.calledOnce).to.be.false;
    });

    it('should create connection when client not established', async () => {
      const spyOnClient = this.sandbox.spy(redisClient, 'on');
      const mockSelectClient = this.sandbox.mock(redisClient).expects('select').once().yields(null);
      const spySetClient = this.sandbox.spy(redisClient, 'set');

      await redisHelper.setDataEx('some-key', 'some-value', 1);

      expect(spyOnClient.calledOnce).to.be.true;
      mockSelectClient.verify();
      expect(spySetClient.calledOnce).to.be.true;
    });
  });

  describe('getData', () => {

    it('should logging when client on error', async () => {
      const mockOnClient = this.sandbox.mock(redisClient).expects('on').yields({});
      const spyLoggerLog = this.sandbox.spy(logger, 'log');
      const mockSelectClient = this.sandbox.mock(redisClient).expects('select').once().yields(null);
      const mockGetClient = this.sandbox.mock(redisClient).expects('get').once().yields({}, true).resolves(null);

      const res = await redisHelper.getData('some-key');

      mockOnClient.verify();
      expect(spyLoggerLog.calledOnce).to.be.true;
      mockSelectClient.verify();
      mockGetClient.verify();
      expect(res.data).to.equal(null);
      expect(res.err).to.not.equal(null);
    });

    it('should cover error on select', async () => {
      const spyOnClient = this.sandbox.spy(redisClient, 'on');
      const mockSelectClient = this.sandbox.mock(redisClient).expects('select').once().yields({});
      const spyLoggerLog = this.sandbox.spy(logger, 'log');
      const spyGetClient = this.sandbox.spy(redisClient, 'get');

      const res = await redisHelper.getData('some-key');

      expect(spyOnClient.calledOnce).to.be.true;
      mockSelectClient.verify();
      expect(spyLoggerLog.calledOnce).to.be.true;
      expect(spyGetClient.calledOnce).to.be.false;
      expect(res.data).to.equal(null);
      expect(res.err).to.not.equal(null);
    });

    it('should cover error on get', async () => {
      const spyOnClient = this.sandbox.spy(redisClient, 'on');
      const mockSelectClient = this.sandbox.mock(redisClient).expects('select').once().yields(null);
      const mockGetClient = this.sandbox.mock(redisClient).expects('get').once().yields({}, true).resolves(null);

      const res = await redisHelper.getData('some-key');

      expect(spyOnClient.calledOnce).to.be.true;
      mockSelectClient.verify();
      mockGetClient.verify();
      expect(res.data).to.equal(null);
      expect(res.err).to.not.equal(null);
    });

    it('should create connection when client not established', async () => {
      const spyOnClient = this.sandbox.spy(redisClient, 'on');
      const mockSelectClient = this.sandbox.mock(redisClient).expects('select').once().yields(null);
      const mockGetClient = this.sandbox.mock(redisClient).expects('get').once().yields(null, true).resolves(null);

      await redisHelper.getData('some-key');

      expect(spyOnClient.calledOnce).to.be.true;
      mockSelectClient.verify();
      mockGetClient.verify();
    });
  });

  describe('getAllKeys', () => {

    it('should logging when client on error', async () => {
      const mockOnClient = this.sandbox.mock(redisClient).expects('on').yields({});
      const spyLoggerLog = this.sandbox.spy(logger, 'log');
      const mockSelectClient = this.sandbox.mock(redisClient).expects('select').once().yields(null);
      const mockKeysClient = this.sandbox.mock(redisClient).expects('keys').once().yields({}, true).resolves(null);

      const res = await redisHelper.getAllKeys('some-key');

      expect(spyLoggerLog.calledOnce).to.be.true;
      mockOnClient.verify();
      mockSelectClient.verify();
      mockKeysClient.verify();
      expect(res.data).to.equal(null);
      expect(res.err).to.not.equal(null);
    });

    it('should cover error on select', async () => {
      const spyOnClient = this.sandbox.spy(redisClient, 'on');
      const mockSelectClient = this.sandbox.mock(redisClient).expects('select').once().yields({});
      const spyLoggerLog = this.sandbox.spy(logger, 'log');
      const spyKeysClient = this.sandbox.spy(redisClient, 'keys');

      const res = await redisHelper.getAllKeys('some-key');

      expect(spyOnClient.calledOnce).to.be.true;
      mockSelectClient.verify();
      expect(spyLoggerLog.calledOnce).to.be.true;
      expect(spyKeysClient.calledOnce).to.be.false;
      expect(res.data).to.equal(null);
      expect(res.err).to.not.equal(null);
    });

    it('should cover error on keys', async () => {
      const spyOnClient = this.sandbox.spy(redisClient, 'on');
      const mockSelectClient = this.sandbox.mock(redisClient).expects('select').once().yields(null);
      const mockKeysClient = this.sandbox.mock(redisClient).expects('keys').once().yields({}, true).resolves(null);

      const res = await redisHelper.getAllKeys('some-key');

      expect(spyOnClient.calledOnce).to.be.true;
      mockSelectClient.verify();
      mockKeysClient.verify();
      expect(res.data).to.equal(null);
      expect(res.err).to.not.equal(null);
    });

    it('should create connection when client not established', async () => {
      const spyOnClient = this.sandbox.spy(redisClient, 'on');
      const mockSelectClient = this.sandbox.mock(redisClient).expects('select').once().yields(null);
      const mockKeysClient = this.sandbox.mock(redisClient).expects('keys').once().yields(null, true).resolves(null);

      const res = await redisHelper.getAllKeys('some-keys');

      expect(spyOnClient.calledOnce).to.be.true;
      mockSelectClient.verify();
      mockKeysClient.verify();
      expect(res.data).to.not.equal(null);
      expect(res.err).to.equal(null);
    });
  });

  describe('deleteKey', () => {

    it('should logging when client on error', async () => {
      const mockOnClient = this.sandbox.mock(redisClient).expects('on').yields({});
      const spyLoggerLog = this.sandbox.spy(logger, 'log');
      const mockSelectClient = this.sandbox.mock(redisClient).expects('select').once().yields(null);
      const mockDelClient = this.sandbox.mock(redisClient).expects('del').once().yields({}, true);

      const res = await redisHelper.deleteKey('some-key');

      expect(spyLoggerLog.calledOnce).to.be.true;
      mockOnClient.verify();
      mockSelectClient.verify();
      mockDelClient.verify();
      expect(res.data).to.equal(null);
      expect(res.err).to.not.equal(null);
    });

    it('should cover error on select', async () => {
      const spyOnClient = this.sandbox.spy(redisClient, 'on');
      const mockSelectClient = this.sandbox.mock(redisClient).expects('select').once().yields({});
      const spyLoggerLog = this.sandbox.spy(logger, 'log');
      const spyDelClient = this.sandbox.spy(redisClient, 'del');

      const res = await redisHelper.deleteKey('some-key');

      expect(spyOnClient.calledOnce).to.be.true;
      mockSelectClient.verify();
      expect(spyLoggerLog.calledOnce).to.be.true;
      expect(spyDelClient.calledOnce).to.be.false;
      expect(res.data).to.equal(null);
      expect(res.err).to.not.equal(null);
    });

    it('should cover error on delete', async () => {
      const spyOnClient = this.sandbox.spy(redisClient, 'on');
      const mockSelectClient = this.sandbox.mock(redisClient).expects('select').once().yields(null);
      const mockDelClient = this.sandbox.mock(redisClient).expects('del').once().yields({}, true);

      const res = await redisHelper.deleteKey('some-key');

      expect(spyOnClient.calledOnce).to.be.true;
      mockSelectClient.verify();
      mockDelClient.verify();
      expect(res.data).to.equal(null);
      expect(res.err).to.not.equal(null);
    });

    it('should create connection when client not established', async () => {
      const spyOnClient = this.sandbox.spy(redisClient, 'on');
      const mockSelectClient = this.sandbox.mock(redisClient).expects('select').once().yields(null);
      const mockDelClient = this.sandbox.mock(redisClient).expects('del').once().yields(null, true);

      const res = await redisHelper.deleteKey('some-key');

      expect(spyOnClient.calledOnce).to.be.true;
      mockSelectClient.verify();
      mockDelClient.verify();
      expect(res.data).to.not.equal(null);
      expect(res.err).to.equal(null);
    });
  });

  describe('setZeroAttemp', () => {

    it('should logging when client on error', async () => {
      const mockOnClient = this.sandbox.mock(redisClient).expects('on').yields({});
      const spyLoggerLog = this.sandbox.spy(logger, 'log');
      const mockSetClient = this.sandbox.mock(redisClient).expects('set').once().yields({}, true);

      const res = await redisHelper.setZeroAttemp('some-key');

      expect(spyLoggerLog.calledOnce).to.be.true;
      mockOnClient.verify();
      mockSetClient.verify();
      expect(res.data).to.equal(null);
      expect(res.err).to.not.equal(null);
    });

    it('should cover error', async () => {
      const spyOnClient = this.sandbox.spy(redisClient, 'on');
      const mockSetClient = this.sandbox.mock(redisClient).expects('set').once().yields({}, true);

      const res = await redisHelper.setZeroAttemp('some-key');

      expect(spyOnClient.calledOnce).to.be.true;
      mockSetClient.verify();
      expect(res.data).to.equal(null);
      expect(res.err).to.not.equal(null);
    });

    it('should create connection when client not established', async () => {
      const spyOnClient = this.sandbox.spy(redisClient, 'on');
      const mockSetClient = this.sandbox.mock(redisClient).expects('set').once().yields(null, true);

      const res = await redisHelper.setZeroAttemp('some-key', 1);

      expect(spyOnClient.calledOnce).to.be.true;
      mockSetClient.verify();
      expect(res.data).to.not.equal(null);
      expect(res.err).to.equal(null);
    });
  });

  describe('incrAttempt', () => {

    it('should logging when client on error', async () => {
      const mockOnClient = this.sandbox.mock(redisClient).expects('on').yields({});
      const spyLoggerLog = this.sandbox.spy(logger, 'log');
      const mockIncrClient = this.sandbox.mock(redisClient).expects('incr').once().yields({}, true);

      const res = await redisHelper.incrAttempt('some-key');

      expect(spyLoggerLog.calledOnce).to.be.true;
      mockOnClient.verify();
      mockIncrClient.verify();
      expect(res.data).to.equal(null);
      expect(res.err).to.not.equal(null);
    });

    it('should cover error', async () => {
      const spyOnClient = this.sandbox.spy(redisClient, 'on');
      const mockIncrClient = this.sandbox.mock(redisClient).expects('incr').once().yields({}, true);

      const res = await redisHelper.incrAttempt('some-key');

      expect(spyOnClient.calledOnce).to.be.true;
      mockIncrClient.verify();
      expect(res.data).to.equal(null);
      expect(res.err).to.not.equal(null);
    });

    it('should using established connection', async () => {
      const spyOnClient = this.sandbox.spy(redisClient, 'on');
      const mockIncrClient = this.sandbox.mock(redisClient).expects('incr').once().yields(null, true);

      const res = await redisHelper.incrAttempt('some-key');

      expect(spyOnClient.calledOnce).to.be.true;
      mockIncrClient.verify();
      expect(res.data).to.not.equal(null);
      expect(res.err).to.equal(null);
    });
  });

  describe('setReminder', () => {

    it('should logging when client on error', async () => {
      const mockOnClient = this.sandbox.mock(redisClient).expects('on').yields({});
      const spyLoggerLog = this.sandbox.spy(logger, 'log');
      const mockExecClient = this.sandbox.mock(redisClient).expects('multi').once().returns({
        set: this.sandbox.stub().returns({
          expire: this.sandbox.stub().returns({
            exec: this.sandbox.stub().yields(null, true)
          })
        })
      });

      await redisHelper.setReminder('some-key', 'some-value', 1, 'some-action');

      expect(spyLoggerLog.calledOnce).to.be.true;
      mockOnClient.verify();
      mockExecClient.verify();
    });

    it('should cover error', async () => {
      const spyOnClient = this.sandbox.spy(redisClient, 'on');
      const mockExecClient = this.sandbox.mock(redisClient).expects('multi').once().returns({
        set: this.sandbox.stub().returns({
          expire: this.sandbox.stub().returns({
            exec: this.sandbox.stub().yields(null, true)
          })
        })
      });

      await redisHelper.setReminder('some-key', 'some-value', 1, 'some-action');

      expect(spyOnClient.calledOnce).to.be.true;
      mockExecClient.verify();
    });

    it('should create connection when client not established', async () => {
      const spyOnClient = this.sandbox.spy(redisClient, 'on');
      const mockExecClient = this.sandbox.mock(redisClient).expects('multi').once().returns({
        set: this.sandbox.stub().returns({
          expire: this.sandbox.stub().returns({
            exec: this.sandbox.stub().yields({}, true)
          })
        })
      });

      await redisHelper.setReminder('some-key', 'some-value', 1, 'some-action');

      expect(spyOnClient.calledOnce).to.be.true;
      mockExecClient.verify();
    });
  });
});
