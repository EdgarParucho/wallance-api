'use strict';
const { DataTypes } = require('sequelize');
const { FUND_TABLE, fundSchema } = require('../src/db/models/fundModel');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.renameColumn(FUND_TABLE, 'isDefault', 'is_default')
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.renameColumn(FUND_TABLE, 'is_default', 'isDefault')
  }
};
