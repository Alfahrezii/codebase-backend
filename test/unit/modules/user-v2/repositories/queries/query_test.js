const assert = require('assert');
const sinon = require('sinon');

const Query = require('../../../../../../bin/modules/user-v2/repositories/queries/query');

const db = {
  setCollection: sinon.stub(),
  findOne: sinon.stub().resolves({
    err: null,
    data: {},
    code: 200
  }),
};

const dbError = {
  setCollection: sinon.stub(),
  findOne: sinon.stub().resolves({
    err: 'err',
    data: null,
    code: 404
  }),
};

describe('User V2 - Query', () => {
  const id = '5e6eed0aa2ee705ee7714ee5';
  const params = [];

  describe('findOneUser', () => {

    it('should return data success', async () => {
      const query = new Query(db);
      const res = await query.findOneUser(params);
      assert.notStrictEqual(res.data, null);
      assert.strictEqual(res.code, 200);
    });

    it('should return data error', async () => {
      const query = new Query(dbError);
      const res = await query.findOneUser(params);
      assert.notStrictEqual(res.err, null);
    });
  });

  describe('findById', () => {

    it('should return data success', async () => {
      const query = new Query(db);
      const res = await query.findById(id);
      assert.notStrictEqual(res.data, null);
      assert.strictEqual(res.code, 200);
    });

    it('should return data error', async () => {
      const query = new Query(dbError);
      const res = await query.findById(id);
      assert.notStrictEqual(res.err, null);
    });
  });

});
