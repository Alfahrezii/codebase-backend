const joi = require('joi');

const login = joi.object({
  username: [
    joi.string().email(),
    joi.string().regex(/^[+]62/)
  ],
  password: joi.string().required()
});

const logout = joi.object({
  accessToken: joi.string().required()
});

const register = joi.object({
  username: [
    joi.string().email(),
    joi.string().regex(/^[+]62/)
  ],
  password: joi.string().required()
});

const refreshToken = joi.object({
  refreshToken: joi.string().required()
});

const verifyOtp = joi.object({
  username: [
    joi.string().email(),
    joi.string().regex(/^[+]62/)
  ],
  otp: joi.string().required()
});

module.exports = {
  login,
  logout,
  register,
  refreshToken,
  verifyOtp,
};
