const environment = process.env.NODE_ENV;

if (environment === 'development') require('dotenv').config();

const config = {
  environment,
  port: process.env.PORT || 3000,
};

module.exports = config;
