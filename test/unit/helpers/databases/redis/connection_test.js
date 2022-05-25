const sinon = require('sinon');
const redis = require('redis');

const rewire = require('rewire');
const connRewire = rewire('../../../../../bin/helpers/databases/redis/connection');

describe('Redis Connection', () => {

  describe('createConnectionPool', () => {

    beforeEach(() => {
      this.sandbox = sinon.createSandbox();
      this.createConnectionPool = connRewire.__get__('createConnectionPool');
    });

    afterEach(() => {
      connRewire.__set__('connectionPool', []);
      this.sandbox.restore();
    });

    it('should return an error if server refused the connection', async () => {
      const options = { error: { code: 'ECONNREFUSED' } };
      let returnValue;
      const createClientStub = this.sandbox.stub(redis, 'createClient').callsFake(async (clientOpts) => {
        returnValue = await clientOpts.retry_strategy(options);
      });

      await this.createConnectionPool({});

      this.sandbox.assert.match(returnValue.message, 'The server refused the connection');
      this.sandbox.assert.calledWithExactly(createClientStub, { retry_strategy: this.sandbox.match.func });
    });

    it('should return an error if server reset the connection', async () => {
      const options = { error: { code: 'ECONNRESET' } };
      let returnValue;
      const createClientStub = this.sandbox.stub(redis, 'createClient').callsFake(async (clientOpts) => {
        returnValue = await clientOpts.retry_strategy(options);
      });

      await this.createConnectionPool({});

      this.sandbox.assert.match(returnValue.message, 'The server reset the connection');
      this.sandbox.assert.calledWithExactly(createClientStub, { retry_strategy: this.sandbox.match.func });
    });

    it('should return an error if server timeouted the connection', async () => {
      const options = { error: { code: 'ETIMEDOUT' } };
      let returnValue;
      const createClientStub = this.sandbox.stub(redis, 'createClient').callsFake((clientOpts) => {
        returnValue = clientOpts.retry_strategy(options);
      });

      await this.createConnectionPool({});

      this.sandbox.assert.match(returnValue.message, 'The server timeouted the connection');
      this.sandbox.assert.calledWithExactly(createClientStub, { retry_strategy: this.sandbox.match.func });
    });

    it('should return an error if retry time exhausted', async () => {
      const options = { total_retry_time: 1000 * 60 * 60 + 1 };
      let returnValue;
      const createClientStub = this.sandbox.stub(redis, 'createClient').callsFake((clientOpts) => {
        returnValue = clientOpts.retry_strategy(options);
      });

      await this.createConnectionPool({});

      this.sandbox.assert.match(returnValue.message, 'Retry time exhausted');
      this.sandbox.assert.calledWithExactly(createClientStub, { retry_strategy: this.sandbox.match.func });
    });

    it('should return undefined if retry attempt exceed', async () => {
      const options = { attempt: 11 };
      let returnValue;
      const createClientStub = this.sandbox.stub(redis, 'createClient').callsFake((clientOpts) => {
        returnValue = clientOpts.retry_strategy(options);
      });

      await this.createConnectionPool({});

      this.sandbox.assert.match(returnValue, undefined);
      this.sandbox.assert.calledWithExactly(createClientStub, { retry_strategy: this.sandbox.match.func });
    });

    it('should return retry strategy', async () => {
      const options = { attempt: 5 };
      let returnValue;
      const createClientStub = this.sandbox.stub(redis, 'createClient').callsFake((clientOpts) => {
        returnValue = clientOpts.retry_strategy(options);
      });

      await this.createConnectionPool({});

      this.sandbox.assert.match(returnValue, 500);
      this.sandbox.assert.calledWithExactly(createClientStub, { retry_strategy: this.sandbox.match.func });
    });
  });
});
