const { Sequelize } = require('sequelize');
const { environment } = require('../config/server');
const database = require('../config/database')[environment];
const setupModels = require('../models');

const sequelize = new Sequelize({
  ...database,
  dialectModule: require('pg'),
  logging: environment === 'production' ? false : console.log,
});

setupModels(sequelize);

module.exports = sequelize;
