const Joi = require('joi');

const OTPValidationSchema = Joi.object({
  email: Joi.string().email().required(),
  action: Joi.string().required(),
  emailShouldBeStored: Joi.boolean().required(),
});

module.exports = { OTPValidationSchema };
