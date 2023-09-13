const { Sequelize } = require('sequelize');
const config = require('../config');
const setupModels = require('../db/models');

const USER = encodeURIComponent(config.dbUser);
const PASSWORD = encodeURIComponent(config.dbPassword);
const URI = `postgres://${USER}:${PASSWORD}@${config.dbHost}/${config.dbName}`;

const sequelize = new Sequelize(URI, {
  dialect: 'postgres',
  logging: console.log,
  dialectOptions: {
    ssl: true,
  }
});

setupModels(sequelize);

module.exports = sequelize;
