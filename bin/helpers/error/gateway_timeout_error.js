class GatewayTimeoutError {
  constructor(param = 'Gateway Timeout') {
    this.message = param.message || param;
    this.data = param.data;
    this.code = param.code;
  }
}

module.exports = GatewayTimeoutError;
