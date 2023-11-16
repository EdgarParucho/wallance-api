const Joi = require('joi');

const email = Joi.string().email();
const password = Joi.string().length(8);
const preferences = Joi.object()

const updateUserSchema = Joi.object({
  email,
  password,
  preferences
});

module.exports = { updateUserSchema };
