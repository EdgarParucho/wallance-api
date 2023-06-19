const { ValidationError } = require('sequelize');

function logError(err, req, res, next) {
  console.error(err)
  next(err)
}

function boomErrorHandler(err, req, res, next) {
  if (err.isBoom) {
    const { output } = err;
    res.status(output.statusCode).send(output.payload.message)
  }
  else next(err)
}


function ORMErrorHandler(err, req, res, next) {
  if (err instanceof ValidationError) {
    const [firstError] = err.errors;
    res.status(409).json({
      statusCode: 409,
      message: firstError.message,
      errors: err.errors
    })
  }
  else next(err);
}

function errorHandler(err, req, res, next) {
  const message = err.message || err.name;
  res.status(500).send(message)
}

module.exports = { logError, boomErrorHandler, errorHandler, ORMErrorHandler };