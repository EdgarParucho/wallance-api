function payloadValidator({ schema, key }) {
  return (req, res, next) => {
    const data = req[key];
    const { error } = schema.validate(data);
    if (error) next({ statusCode: 400, message: error.message, data: null });
    else next();
  }
}

module.exports = payloadValidator;
