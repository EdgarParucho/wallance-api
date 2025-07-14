const { auth, requiredScopes } = require('express-oauth2-jwt-bearer');
const { authAud, authIss, authAlg, authScope } = require('../config/auth');
const { demoUser } = require('../config/auth');

const checkJWT = auth({
  audience: authAud,
  issuerBaseURL: authIss,
  tokenSigningAlg: authAlg,
});

const setDemoData = (req, res, next) => {
  req.auth = { payload: { sub: demoUser } };
  next();
}

const checkScopes = requiredScopes(authScope);

module.exports = { checkJWT, checkScopes, setDemoData };
