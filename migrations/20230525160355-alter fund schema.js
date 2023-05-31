'use strict';

const { FUND_TABLE, fundSchema } = require('../src/db/models/fundModel');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn(FUND_TABLE, 'balance', fundSchema.balance);
    await queryInterface.renameColumn(FUND_TABLE, 'createdAt', fundSchema.createdAt.field);
    await queryInterface.renameColumn(FUND_TABLE, 'updatedAt', fundSchema.updatedAt.field);
  },
  
  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn(FUND_TABLE, 'balance', { allowNull: false, type: DataTypes.FLOAT });
    await queryInterface.renameColumn(FUND_TABLE, 'created_at', 'createdAt');
    await queryInterface.renameColumn(FUND_TABLE, 'updated_at', 'updatedAt');
  }
};
