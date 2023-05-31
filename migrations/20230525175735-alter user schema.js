'use strict';

const { USER_TABLE } = require('../src/db/models/userModel');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn(USER_TABLE, 'createdAt', 'created_at');
    await queryInterface.renameColumn(USER_TABLE, 'updatedAt', 'updated_at');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn(USER_TABLE, 'created_at', 'createdAt');
    await queryInterface.renameColumn(USER_TABLE, 'updated_at', 'updatedAt');
  }
};
