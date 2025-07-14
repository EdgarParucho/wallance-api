const Joi = require('joi');

const id = Joi.string().uuid().required();
const name = Joi.string().min(4).max(20);
const description = Joi.string().min(4).max(50);

const create = Joi.object({
  name: name.required(),
  description: description.required(),
});
const update = Joi.object({ name, description });
const alter = Joi.object({ id });

module.exports = { create, update, alter };
