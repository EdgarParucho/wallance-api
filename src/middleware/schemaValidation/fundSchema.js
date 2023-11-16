const Joi = require('joi');

const id = Joi.string().uuid();
const name = Joi.string().min(4).max(20);
const description = Joi.string().min(4).max(50);

const createFundSchema = Joi.object({
  name: name.required(),
  description: description.required(),
});

const updateFundSchema = Joi.object({
  name,
  description,
});

const fundIDSchema = Joi.object({
  id: id.required()
});

module.exports = { createFundSchema, updateFundSchema, fundIDSchema };
