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
    await queryInterface.sequelize.query("ALTER TABLE funds ALTER COLUMN is_default TYPE BOOLEAN USING 'true'::BOOLEAN")
    // await queryInterface.changeColumn(FUND_TABLE, 'isDefault', { name: 'is_default' })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
