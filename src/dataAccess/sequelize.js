const { Sequelize } = require('sequelize');
const setupModels = require('../models');
const { url, ...options } = require('../config/database');

const sequelize = new Sequelize(url, {
  dialectModule: require('pg'),
  ...options,
});

setupModels(sequelize);

module.exports = sequelize;
