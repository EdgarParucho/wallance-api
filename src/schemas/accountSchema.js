const Joi = require('joi');

const email = Joi.string().email();
const password = Joi.string().length(8);

const updateUserSchema = Joi.object({
  email,
  password
});

module.exports = { updateUserSchema };
