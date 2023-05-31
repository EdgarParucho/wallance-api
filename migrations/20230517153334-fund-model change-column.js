'use strict';

const { DataTypes } = require('sequelize');
const { fundSchema, FUND_TABLE } = require('../src/db/models/fundModel');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.removeColumn(FUND_TABLE, 'users');
    await queryInterface.addColumn(FUND_TABLE, 'users', fundSchema.users);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn(FUND_TABLE, 'users');
    await queryInterface.addColumn(FUND_TABLE, 'users', { allowNull: false, type: DataTypes.ARRAY(DataTypes.INTEGER) });
  }
};
