const { mailHost, mailPort, mailUser, mailPass } = require('./mail');
const { authAud, authIss, authAlg, authScope } = require('./auth');

const config = {
  env: process.env.NODE_ENV || 'dev',
  port: process.env.PORT || 3000,
  dbURL: process.env.POSTGRES_URL,
  jwtSecret: process.env.JWT_SECRET,
  mailHost,
  mailPort,
  mailUser,
  mailPass,
  authIss,
  authAud,
  authAlg,
  authScope,
}

module.exports = config;
