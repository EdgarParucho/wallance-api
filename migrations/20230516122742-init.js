'use strict';

const { FUND_TABLE, fundSchema } = require('../src/db/models/fundModel');
const { RECORD_TABLE, recordSchema } = require('../src/db/models/recordModel');
const { USER_TABLE, userSchema } = require('../src/db/models/userModel');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(USER_TABLE, userSchema);
    await queryInterface.createTable(FUND_TABLE, fundSchema);
    await queryInterface.createTable(RECORD_TABLE, recordSchema);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(RECORD_TABLE);
    await queryInterface.dropTable(FUND_TABLE);
    await queryInterface.dropTable(USER_TABLE);
  }
};
