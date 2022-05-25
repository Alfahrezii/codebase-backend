const { expect } = require('chai');

const common = require('../../../../../bin/modules/user-v2/utils/common');

describe('User V2 - Common Utils', () => {

  describe('filterEmailOrMobileNumber', () => {

    it('should return filter data as email', async () => {

      const result = common.filterEmailOrMobileNumber('some@email.com');

      expect(result).to.own.property('email');
    });

    it('should return filter data as mobile number', async () => {

      const result = common.filterEmailOrMobileNumber('+62 821-0000-0000');

      expect(result).to.own.property('mobileNumber');
    });
  });
});
