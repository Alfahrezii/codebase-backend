
class ExpectationFailedError {
  constructor(param = 'Expectation Failed') {
    this.message = param.message || param;
    this.data = param.data;
    this.code = param.code;
  }
}

module.exports = ExpectationFailedError;
