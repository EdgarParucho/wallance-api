const config = require('.');

const URI = config.dbURL;

module.exports = {
  url: URI,
  dialect: 'postgres',
  dialectOptions: {
    ssl: process.env.NODE_ENV === "production",
  },
}
