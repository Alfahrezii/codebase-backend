
class NotFoundError {
  constructor(param = 'Not Found') {
    this.message = param.message || param;
    this.data = param.data;
    this.code = param.code;
  }
}

module.exports = NotFoundError;
