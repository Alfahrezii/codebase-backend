const { expect } = require('chai');
const sinon = require('sinon');

const validator = require('../../../../bin/helpers/utils/validator');
const joi = require('joi');

describe('User V2 - Common Utils', () => {

  describe('findOneUser', () => {

    it('should return invalid', async () => {
      const mockJoiValidate = sinon.mock(joi).expects('validate').once().returns({
        error: {
          details: []
        }
      });

      const res = validator.isValidPayload(sinon.stub(), sinon.stub());

      mockJoiValidate.verify();
      expect(res.data).to.equal(null);
      expect(res.err).to.not.equal(null);
      mockJoiValidate.restore();
    });

    it('should return success', async () => {
      const mockJoiValidate = sinon.mock(joi).expects('validate').once().returns({value: sinon.stub()});

      const res = validator.isValidPayload(sinon.stub(), sinon.stub());

      mockJoiValidate.verify();
      expect(res.data).to.not.equal(null);
      expect(res.err).to.equal(null);
      mockJoiValidate.restore();
    });
  });
});
