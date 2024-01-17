function errorLogger(err, req, res, next) {
  console.log(err.data?.message || err.message);
  next(err)
}

function validateConnectionError(err) {
  const { ConnectionError, ConnectionTimedOutError, ConnectionRefusedError } = require('sequelize');
  const connectionErrors = [ConnectionError, ConnectionTimedOutError, ConnectionRefusedError];
  return connectionErrors.some(connectionError => err instanceof connectionError);
}

function connectionErrorHandler(err, req, res, next) {
  const connectionError = validateConnectionError(err);
  if (connectionError) next({
    statusCode: 503,
    message: "Service is temporarily unavailable.",
    data: null,
  })
  else next(err);
}

function ORMErrorHandler(err, req, res, next) {
  const { ValidationError } = require('sequelize');
  if (err instanceof ValidationError) next({
    statusCode: 409,
    message: err.message,
    data: null,
  })
  else next(err);
}

function errorResponseHandler(err, req, res, next) {
  const { statusCode, message, data } = err;
  res.status(statusCode || 500).json({
    statusCode: statusCode || 500,
    message: err.response?.data?.message || message || "Internal server error.",
    data: null,
  })
}

module.exports = {
  errorLogger,
  connectionErrorHandler,
  ORMErrorHandler,
  errorResponseHandler,
};
