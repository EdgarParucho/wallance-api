const { ConnectionError, ConnectionTimedOutError, ConnectionRefusedError } = require('sequelize');

function validateConnectionError(err) {
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

module.exports = connectionErrorHandler