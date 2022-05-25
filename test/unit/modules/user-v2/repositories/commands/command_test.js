const assert = require('assert');
const sinon = require('sinon');

const Command = require('../../../../../../bin/modules/user-v2/repositories/commands/command');

const db = {
  setCollection: sinon.stub(),
  insertOne: sinon.stub().resolves({
    err: null,
    data: {},
    code: 200
  }),
  upsertOne: sinon.stub().resolves({
    err: null,
    data: {},
    code: 200
  }),
};

const dbError = {
  setCollection: sinon.stub(),
  insertOne: sinon.stub().resolves({
    err: 'err',
    data: null,
    code: 404
  }),
  upsertOne: sinon.stub().resolves({
    err: 'err',
    data: null,
    code: 404
  }),
};

describe('User V2 - Command', () => {
  const id = '5e6eed0aa2ee705ee7714ee5';
  const params = [];

  describe('insertOne', () => {
    it('should return data success', async () => {
      const query = new Command(db);
      const res = await query.insertOneUser(params);
      assert.notStrictEqual(res.data, null);
      assert.strictEqual(res.code, 200);
    });
    it('should return data error', async () => {
      const query = new Command(dbError);
      const res = await query.insertOneUser(params);
      assert.notStrictEqual(res.err, null);
    });
  });

  describe('UpsertOne', () => {
    it('should return data success', async () => {
      const query = new Command(db);
      const res = await query.upsertOneUser(id, params);
      assert.notStrictEqual(res.data, null);
      assert.strictEqual(res.code, 200);
    });
    it('should return data error', async () => {
      const query = new Command(dbError);
      const res = await query.upsertOneUser(id, params);
      assert.notStrictEqual(res.err, null);
    });
  });
});
