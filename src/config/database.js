const config = require('.');

const USER = encodeURIComponent(config.dbUser);
const PASSWORD = encodeURIComponent(config.dbPassword);
const URI = `postgresql://${USER}:${PASSWORD}@${config.dbHost}:${config.dbPort}/${config.dbName}`;

module.exports = {
  url: URI,
  dialect: 'postgres',
  dialectOptions: {
    ssl: process.env.NODE_ENV === "production",
  },
}
