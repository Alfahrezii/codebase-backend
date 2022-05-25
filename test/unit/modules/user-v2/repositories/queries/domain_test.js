const sinon = require('sinon');
const { expect } = require('chai');

const query = require('../../../../../../bin/modules/user-v2/repositories/queries/query');
const User = require('../../../../../../bin/modules/user-v2/repositories/queries/domain');
const logger = require('../../../../../../bin/helpers/utils/logger');

describe('User V2 - Domain', () => {

  const queryResult = {
    err: null,
    data: {
      _id: 'some-object-id'
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

  describe('getUser', () => {

    const payload = sinon.stub();

    it('should return error user not found', async() => {
      this.sandbox.stub(query.prototype, 'findById').resolves(queryResultError);

      const res = await user.viewUser(payload);

      expect(res.data).to.equal(null);
      expect(res.err).to.not.equal(null);
    });

    it('should return success', async() => {
      this.sandbox.stub(query.prototype, 'findById').resolves(queryResult);

      const res = await user.viewUser(payload);

      expect(res.data).to.not.equal(null);
      expect(res.data).to.has.not.own.property('password');
      expect(res.err).to.equal(null);
    });
  });
});
