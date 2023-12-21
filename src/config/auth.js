const authIss = process.env.AUTH_ISS;
const authAud = process.env.AUTH_AUD;
const authAlg = process.env.AUTH_ALG
const authScope = process.env.AUTH_SCOPE;

module.exports = {
  authIss,
  authAud,
  authAlg,
  authScope,
};