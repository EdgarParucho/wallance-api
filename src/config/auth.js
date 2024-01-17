const authIss = process.env.AUTH0_ISSUER;
const authAud = process.env.AUTH0_AUDIENCE;
const authAlg = process.env.AUTH0_ALGORITHM;
const authScope = process.env.AUTH0_SCOPE;
const authClientSecret = process.env.AUTH0_CLIENT_SECRET;
const authClientID = process.env.AUTH0_CLIENT_ID;
const authGrantType = process.env.AUTH0_GRANT_TYPE;

module.exports = {
  authIss,
  authAud,
  authAlg,
  authScope,
  authClientSecret,
  authClientID,
  authGrantType,
};