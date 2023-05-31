'use strict';

const { DataTypes } = require('sequelize');
const { RECORD_TABLE, recordSchema } = require('../src/db/models/recordModel');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn(RECORD_TABLE, 'date', recordSchema.date)
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn(RECORD_TABLE, 'date', { allowNull: false, type: DataTypes.DATE })
  }
};
