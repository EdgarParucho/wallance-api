const authIss = process.env.AUTH_ISS;
const authAud = process.env.AUTH_AUD;
const authAlg = process.env.AUTH_ALG
const authScope = process.env.AUTH_SCOPE;
const authClientSecret = process.env.AUTH_CLIENT_SECRET;
const authClientID = process.env.AUTH_CLIENT_ID;
const authGrantType = process.env.AUTH_GRANT_TYPE;

module.exports = {
  authIss,
  authAud,
  authAlg,
  authScope,
  authClientSecret,
  authClientID,
  authGrantType,
};