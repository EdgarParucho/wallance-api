const Joi  = require('joi');

const OTPRequestSchema = Joi.object({
  email: Joi.string().email(),
  emailShouldBeStored: Joi.boolean().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().length(8).required()
});

module.exports = { loginSchema, OTPRequestSchema };
