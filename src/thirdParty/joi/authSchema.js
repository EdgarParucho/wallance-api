const Joi  = require('joi');

const OTPRequestSchema = Joi.object({
  email: Joi.string().email(),
  emailShouldBeStored: Joi.boolean().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
});

module.exports = { loginSchema, OTPRequestSchema };
