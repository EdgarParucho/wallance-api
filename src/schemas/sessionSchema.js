const Joi  = require('joi');

const email = Joi.string().email();
const password = Joi.string().length(8);

const startSessionSchema = Joi.object({
  email: email.required(),
  password: password.required()
})

module.exports = { startSessionSchema };
