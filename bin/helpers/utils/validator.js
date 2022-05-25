const joi = require('joi');
const validate = require('validate.js');
const wrapper = require('./wrapper');

const isValidPayload = (payload, constraint) => {
  let errMessage = [];
  if (!payload) {
    return wrapper.error(new Error('payload is empty'));
  }
  const { value, error } = joi.validate(payload, constraint);
  if(!validate.isEmpty(error)){
    error.details.forEach(detail => {
      errMessage.push(detail.message);
    });
    return wrapper.error(new Error(errMessage));
  }
  return wrapper.data(value, 'success', 200);

};

module.exports = {
  isValidPayload
};
