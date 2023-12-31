const { auth, requiredScopes } = require('express-oauth2-jwt-bearer');
const { authAud, authIss, authAlg, authScope } = require('../config');

const checkJWT = auth({
  audience: authAud,
  issuerBaseURL: authIss,
  tokenSigningAlg: authAlg,
});

const checkScopes = requiredScopes(authScope);

module.exports = { checkJWT, checkScopes };
