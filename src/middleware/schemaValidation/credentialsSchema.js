const Joi  = require('joi');

const signSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().length(8).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().length(8).required()
});

module.exports = { signSchema, loginSchema };
