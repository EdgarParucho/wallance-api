const config = require('../config');

const USER = encodeURIComponent(config.dbUser);
const PASSWORD = encodeURIComponent(config.dbPassword);
const URI = `postgres://${USER}:${PASSWORD}@${config.dbHost}/${config.dbName}`;

module.exports = {
  development: {
    url: URI,
    dialect: 'postgres',
    dialectOptions: {
      ssl: true,
    },
  },
  production: {
    url: URI,
    dialect: 'postgres',
    dialectOptions: {
      ssl: true,
    },
  }
}
