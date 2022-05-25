
class InternalServerError {
  constructor(param = 'Internal Server Error') {
    this.message = param.message || param;
    this.data = param.data;
    this.code = param.code;
  }
}

module.exports = InternalServerError;
