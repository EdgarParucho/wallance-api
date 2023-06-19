const Joi = require('joi');

const id = Joi.string().uuid();
const email = Joi.string().email();
const creditSources = Joi.array();
const password = Joi.string().length(8);
const OTP = Joi.number().required().min(1000).max(9999);

const getUserSchema = Joi.object({
  email: email.required()
});

const preValidationSchema = Joi.object({
  email: email.required()
});

const createUserSchema = Joi.object({
  email: email.required(),
  password: password.required(),
  OTP
});

const updateUserSchema = Joi.object({
  email,
  creditSources,
  password
});

const deleteUserSchema = Joi.object({
  id: id.required()
});

const alterUserAuthSchema = Joi.object({
  id: id.required()
});

module.exports = {
  getUserSchema,
  createUserSchema,
  updateUserSchema,
  deleteUserSchema,
  alterUserAuthSchema,
  preValidationSchema
};