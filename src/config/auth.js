const { environment } = require('./server');

const demoUser = process.env.DEMO_USER;

const authConfig = {
  development: {
    authIss: process.env.AUTH0_ISSUER_DEV,
    authAud: process.env.AUTH0_AUDIENCE_DEV,
    authAlg: process.env.AUTH0_ALGORITHM_DEV,
    authScope: process.env.AUTH0_SCOPE_DEV,
    authClientSecret: process.env.AUTH0_CLIENT_SECRET_DEV,
    authClientID: process.env.AUTH0_CLIENT_ID_DEV,
    authGrantType: process.env.AUTH0_GRANT_TYPE_DEV,
    jwtSecret: process.env.JWT_SECRET_DEV,
    demoUser,
  },
  production: {
    authIss: process.env.AUTH0_ISSUER,
    authAud: process.env.AUTH0_AUDIENCE,
    authAlg: process.env.AUTH0_ALGORITHM,
    authScope: process.env.AUTH0_SCOPE,
    authClientSecret: process.env.AUTH0_CLIENT_SECRET,
    authClientID: process.env.AUTH0_CLIENT_ID,
    authGrantType: process.env.AUTH0_GRANT_TYPE,
    jwtSecret: process.env.JWT_SECRET,
    demoUser,
  },
};

module.exports = authConfig[environment];
