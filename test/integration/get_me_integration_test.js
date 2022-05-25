const assert = require('assert');
const sinon = require('sinon');
const hippie = require('hippie');
const jwt = require('jsonwebtoken');
process.env.MONGO_DATABASE_URL='mongodb://localhost:27017/domain';
process.env.PORT=9000;
process.env.BASIC_AUTH_USERNAME='telkom';
process.env.BASIC_AUTH_PASSWORD='da1c25d8-37c8-41b1-afe2-42dd4825bfea';
process.env.PUBLIC_KEY_PATH='public.pem';
process.env.PRIVATE_KEY_PATH='private.pem';
const user = require('../../bin/modules/user/repositories/queries/domain');
const db = require('../../bin/helpers/databases/mongodb/db');
const AppServer = require('../../bin/app/server');
const redis = require('../../bin/helpers/databases/redis/redis');
const promClient = require('prom-client');

describe('Get Me', () => {

  let appServer;

  let result = {
    'err': false,
    'data': {
      '_id': '5bac53b45ea76b1e9bd58e1c',
      'username': 'alifsndev',
      'password': '8789ad457ac341e4fc4cad32'
    }
  };

  let decodedToken = {
    'username': 'alifsn',
    'sub': '5bac53b45ea76b1e9bd58e1c',
    'iat': 1540469257,
    'exp': 1540475257,
    'aud': '97b33193-43ff-4e58-9124-b3a9b9f72c34',
    'iss': 'telkomdev'
  };

  beforeEach(function () {
    appServer = new AppServer();
    this.server = appServer.server;
    sinon.stub(jwt, 'verify').resolves(decodedToken);
  });

  afterEach(function () {
    promClient.register.clear();
    this.server.close();
    jwt.verify.restore();
  });

  after(() => {
    delete process.env.MONGO_DATABASE_URL;
    delete process.env.PORT;
    delete process.env.BASIC_AUTH_USERNAME;
    delete process.env.BASIC_AUTH_PASSWORD;
    delete process.env.PUBLIC_KEY_PATH;
    delete process.env.PRIVATE_KEY_PATH;
  });

  it('Should error when view user for /users/v1/profile', function (done) {

    hippie(this.server)
      .header('authorization','')
      .get('/users/v1/profile')
      .expectStatus(403)
      .end((err, res, body) => {
        if(err){
          throw err;
        }
        done();
      });
  });

  it('Should return data for /users/v1/profile', function (done) {

    sinon.stub(db.prototype, 'findOne').resolves(result);
    sinon.stub(user.prototype, 'viewUser').resolves(result);
    sinon.stub(redis.prototype, 'getData').returns({data: JSON.stringify(result)});

    hippie(this.server)
      .header('authorization', 'Bearer dGVsa29tOmRhMWMyNWQ4LTM3YzgtNDFiMS1hZmUyLTQyZGQ0ODI1YmZlYQ==')
      .get('/users/v1/profile')
      .expectStatus(200)
      .end((err, res, body) => {

        if(err){
          throw err;
        }

        let obj = JSON.parse(body);
        assert.equal(obj.status, result.status);
        assert.equal(obj.data.username, result.data.username);

        db.prototype.findOne.restore();
        user.prototype.viewUser.restore();
        redis.prototype.getData.restore();
        done();
      });
  });

  it('Should return no data for /users/v1/profile', function (done) {

    result = {
      'err': true,
      'data': null
    };

    sinon.stub(db.prototype, 'findOne').resolves(result);
    sinon.stub(user.prototype, 'viewUser').resolves(result);
    sinon.stub(redis.prototype, 'getData').returns(JSON.stringify({data: result}));

    hippie(this.server)
      .header('authorization', 'Bearer dGVsa29tOmRhMWMyNWQ4LTM3YzgtNDFiMS1hZmUyLTQyZGQ0ODI1YmZlYQ==')
      .get('/users/v1/profile')
      .end((err, res, body) => {

        if(err){
          throw err;
        }

        const result = JSON.parse(body);
        assert.equal(result.code, 403);
        assert.equal(result.data, '');

        db.prototype.findOne.restore();
        user.prototype.viewUser.restore();
        redis.prototype.getData.restore();
        done();
      });
  });

});
