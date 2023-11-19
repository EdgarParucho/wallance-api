const Joi = require('joi');

const id = Joi.string().uuid().required();
const name = Joi.string().min(4).max(20);
const description = Joi.string().min(4).max(50);

const createFundSchema = Joi.object({
  name: name.required(),
  description: description.required(),
});
const updateFundSchema = Joi.object({ name, description });
const alterFundSchema = Joi.object({ id });

module.exports = { createFundSchema, updateFundSchema, alterFundSchema };
