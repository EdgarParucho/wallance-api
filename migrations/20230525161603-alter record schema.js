'use strict';

const { RECORD_TABLE, recordSchema } = require('../src/db/models/recordModel');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn(RECORD_TABLE, 'user', 'user_id');
    await queryInterface.renameColumn(RECORD_TABLE, 'sourceID', 'source_id');
    await queryInterface.renameColumn(RECORD_TABLE, 'targetID', 'target_id');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn(RECORD_TABLE, 'user_id', 'user');
    await queryInterface.renameColumn(RECORD_TABLE, 'source_id', 'sourceID');
    await queryInterface.renameColumn(RECORD_TABLE, 'target_id', 'targetID');
  }
};
