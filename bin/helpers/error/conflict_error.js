
class ConflictError {
  constructor(param = 'Conflict') {
    this.message = param.message || param;
    this.data = param.data;
    this.code = param.code;
  }
}

module.exports = ConflictError;
