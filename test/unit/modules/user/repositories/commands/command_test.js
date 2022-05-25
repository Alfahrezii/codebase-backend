const assert = require('assert');
const sinon = require('sinon');

const Command = require('../../../../../../bin/modules/user/repositories/commands/command');

describe('User-command', () => {

  describe('insertOneUser', () => {
    const queryResult = {
      'err': null,
      'data': {
        '_id': '5bac53b45ea76b1e9bd58e1c',
        'username': 'alifsndev',
        'password': '3d3811045545be3a9e91e2352f9c668a:50aa9b313ef3365801335297c09c13f0'
      }
    };

    it('should success to insert data to db', async() => {

      const db = {
        insertOne: sinon.stub().resolves(queryResult),
        setCollection: sinon.stub()
      };
      const command = new Command(db);
      const res = await command.insertOneUser({});
      assert.equal(res.data.username, queryResult.data.username);
    });
  });

});
