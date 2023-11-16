const { Sequelize } = require('sequelize');
const setupModels = require('../models');
const { url, ...options } = require('../config/database');

const sequelize = new Sequelize(url, options);

setupModels(sequelize);

module.exports = sequelize;
