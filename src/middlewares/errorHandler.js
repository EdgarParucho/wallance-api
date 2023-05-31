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

function errorHandler(err, req, res, next) {
  res.status(500).send(err.message)
}

function ORMErrorHandler(err, req, res, next) {
  if (err instanceof ValidationError) {
    res.status(409).json({
      statusCode: 409,
      message: err.name,
      errors: err.errors
    })
  }
  next(err);
}

module.exports = { logError, boomErrorHandler, errorHandler, ORMErrorHandler };
