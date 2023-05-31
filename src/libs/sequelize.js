const { Sequelize } = require('sequelize');
const config = require('../config');
const setupModels = require('../db/models');

const USER = encodeURIComponent(config.dbUser);
const PASSWORD = encodeURIComponent(config.dbPassword);
const URI = `postgres://${USER}:${PASSWORD}@${config.dbHost}:${config.dbPort}/${config.dbName}`;
// const URI = `mysql://${USER}:${PASSWORD}@${config.dbHost}:${config.dbPort}/${config.dbName}`

const sequelize = new Sequelize(URI, {
  dialect: 'postgres',
    // dialect: 'mysql',
  logging: console.log
});

setupModels(sequelize);

// sync is not recommended for production environment
// sequelize.sync();


module.exports = sequelize;
