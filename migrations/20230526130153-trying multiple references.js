'use strict';

const { DataTypes } = require('sequelize');
const { RECORD_TABLE, recordSchema } = require('../src/db/models/recordModel');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn(RECORD_TABLE, 'source_id', recordSchema.sourceID);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn(RECORD_TABLE, 'source_id', {
      _id: { allowNull: false, primaryKey: true, unique: true, type: DataTypes.UUID, defaultValue: Sequelize.UUIDV4 },
      amount: { allowNull: false, type: DataTypes.FLOAT, validation: { min: 0 } },
      date: { allowNull: false, type: DataTypes.DATEONLY },
      note: { allowNull: false, type: DataTypes.STRING },
      sourceID: {
        field: 'source_id',
        allowNull: false,
        type: DataTypes.UUID,
        references: { model: FUND_TABLE, key: '_id' },
      },
      targetID: {
        field: 'target_id',
        allowNull: false,
        type: DataTypes.UUID,
        references: { model: FUND_TABLE, key: '_id' },
      },
      type: { allowNull: false, type: DataTypes.INTEGER },
      userID: {
        field: 'user_id',
        allowNull: false,
        type: DataTypes.UUID,
        references: { model: USER_TABLE, key: '_id' },
        required: true,
        onDelete: 'CASCADE',
      },
      updatedAt: { allowNull: false, type: DataTypes.DATEONLY, default: DataTypes.DATEONLY, field: 'updated_at' },
      createdAt: { allowNull: false, type: DataTypes.DATEONLY, default: DataTypes.DATEONLY, field: 'created_at' }
    });
  }
};
