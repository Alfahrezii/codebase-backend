const sinon = require('sinon');
const winston = require('winston');

const logger = require('../../../../bin/helpers/utils/logger');

describe('Logger', () => {

  beforeEach(() => {
    sinon.stub(winston, 'Logger').resolves(
      {
        info: sinon.stub()
      }
    );
  });

  afterEach(() => {
    winston.Logger.restore();
  });

  describe('log', () => {
    it('should send log', () => {
      logger.log('', { err: 'test'}, '');
    });
  });
});
