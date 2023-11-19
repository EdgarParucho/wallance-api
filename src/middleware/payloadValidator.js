const boom = require('@hapi/boom');

function payloadValidator({ schema, key }) {
  return (req, res, next) => {
    const data = req[key];
    const { error } = schema.validate(data);
    if (error) next(boom.badRequest(error));
    else next();
  }
}

module.exports = payloadValidator;
