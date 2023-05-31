const boom = require('@hapi/boom');
const config = require('../config')

function checkAPIKey(req, res, next) {
  const apiKey = req.headers['api'];
  if (apiKey === config.apiKey) next();
  else next(boom.unauthorized('User is not authenticated'));
}

module.exports = checkAPIKey;