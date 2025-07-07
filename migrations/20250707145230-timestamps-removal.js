'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('records', 'created_at');
    await queryInterface.removeColumn('records', 'updated_at');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('records', 'created_at');
    await queryInterface.addColumn('records', 'updated_at');
  }
};
