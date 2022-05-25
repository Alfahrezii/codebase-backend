const hippie = require('hippie');

const AppServer = require('../../bin/app/server');
const promClient = require('prom-client');

describe('Root', () => {
  let appServer;

  beforeEach(function () {
    appServer = new AppServer();
    this.server = appServer.server;
  });

  afterEach(function () {
    promClient.register.clear();
    this.server.close();
  });

  it('Should access root service', function (done) {

    hippie(this.server)
      .get('/')
      .expectStatus(200)
      .end((err, res, body) => {
        if(err){
          throw err;
        }
        done();
      });
  });
});
