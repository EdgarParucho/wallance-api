const boom = require('@hapi/boom');

// Note, the middleware is created dynamically in the function.
// This allows to receive the required params to operate (schema, property)
// and keeping the middleware format and functionality.
function validatorHandler(schema, property) {
  return (req, res, next) => {
    const data = req[property];
    const { error } = schema.validate(data, { abortEarly: false });
    if (error) next(boom.badRequest(error));
    else next();
  }
}

module.exports = validatorHandler;
