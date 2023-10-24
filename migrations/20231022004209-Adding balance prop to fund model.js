'use strict';

const { DataTypes } = require('sequelize');
const { FUND_TABLE } = require('../src/db/models/fundModel');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(FUND_TABLE, 'balance', {
      type: DataTypes.FLOAT,
      validate: { min: 0 },
      defaultValue: 0,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn(FUND_TABLE, 'balance');
  }
};
