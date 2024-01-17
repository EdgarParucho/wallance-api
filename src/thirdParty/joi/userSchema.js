const Joi = require('joi');

const updateUserSchema = Joi.object({
  password: Joi.string().length(8),
  email: Joi.string().email(),
  user_metadata: Joi.object()
});

module.exports = { updateUserSchema };
