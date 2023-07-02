const Joi = require('joi');

const id = Joi.string().uuid();
const name = Joi.string().min(4).max(20);
const description = Joi.string().min(4).max(50);
const balance = Joi.number().min(0);
const isDefault = Joi.boolean();
const userID = id;

const createFundSchema = Joi.object({
  name: name.required(),
  description: description.required(),
  isDefault: isDefault.required(),
  userID: userID.required()
});

const updateFundSchema = Joi.object({
  name,
  description,
  balance
});

const fundIDSchema = Joi.object({
  id: id.required()
});

const deleteFundSchema = Joi.object({
  id: id.required()
});

module.exports = { createFundSchema, updateFundSchema, deleteFundSchema, fundIDSchema };
