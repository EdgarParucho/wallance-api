const Joi = require('joi');

const email = Joi.string().email();
const password = Joi.string().length(8);
const preferences = Joi.object()

const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().length(8).required(),
});

const updateUserSchema = Joi.object({
  email,
  password,
  preferences
});

module.exports = { createUserSchema, updateUserSchema };
