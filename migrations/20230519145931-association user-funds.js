'use strict';

const { FUND_TABLE, fundSchema } = require('../src/db/models/fundModel');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn(FUND_TABLE, 'owner', fundSchema.owner);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn(FUND_TABLE, 'owner', { allowNull: false, type: DataTypes.INTEGER });
  }
};
