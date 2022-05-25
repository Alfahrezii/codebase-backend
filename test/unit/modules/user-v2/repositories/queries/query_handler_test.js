const queryHandler = require('../../../../../../bin/modules/user-v2/repositories/queries/query_handler');
const User = require('../../../../../../bin/modules/user-v2/repositories/queries/domain');
const sinon = require('sinon');
const { expect } = require('chai');

describe('User V2 - Query Handler', () => {

  const resultSucces = {
    err: null,
    message: 'success',
    data: [],
    code: 200
  };

  describe('getUser', () => {

    it('should return success', async() => {
      sinon.stub(User.prototype, 'viewUser').resolves(resultSucces);

      const res = await queryHandler.getUser({});

      expect(res.data).to.not.equal(null);

      User.prototype.viewUser.restore();
    });
  });
});
