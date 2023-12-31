const Joi = require('joi');

const updateUserSchema = Joi.object({
  preferences: Joi.object(),
});

module.exports = { updateUserSchema };
