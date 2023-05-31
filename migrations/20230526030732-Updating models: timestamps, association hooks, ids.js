'use strict';

const { FUND_TABLE, fundSchema } = require('../src/db/models/fundModel');
const { RECORD_TABLE, recordSchema } = require('../src/db/models/recordModel');
const { USER_TABLE, userSchema } = require('../src/db/models/userModel');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.dropTable(RECORD_TABLE)
    await queryInterface.dropTable(USER_TABLE)
    await queryInterface.dropTable(FUND_TABLE)
    await queryInterface.createTable(USER_TABLE, userSchema)
    await queryInterface.createTable(FUND_TABLE, fundSchema)
    await queryInterface.createTable(RECORD_TABLE, recordSchema)
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable(RECORD_TABLE)
    await queryInterface.dropTable(USER_TABLE)
    await queryInterface.dropTable(FUND_TABLE)
    
    await queryInterface.createTable(USER_TABLE, {
      _id: { allowNull: false, autoIncrement: true, primaryKey: true, type: DataTypes.INTEGER },
      email: { allowNull: false, type: DataTypes.STRING, unique: true },
      password: { allowNull: false, type: DataTypes.STRING },
      creditSources: { allowNull: false, type: DataTypes.JSON, field: 'credit_sources' }
    })
    await queryInterface.createTable(FUND_TABLE, {
      _id: { allowNull: false, primaryKey: true, unique: true, type: DataTypes.UUID, defaultValue: Sequelize.UUIDV4 },
      balance: { allowNull: false, type: DataTypes.FLOAT, defaultValue: 0 },
      name: { allowNull: false, type: DataTypes.STRING },
      description: { allowNull: false, type: DataTypes.STRING },
      isDefault: { allowNull: false, type: DataTypes.BOOLEAN, field: 'is_default' },
      userID: {
        field: 'user_id',
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: USER_TABLE,
          key: '_id',
          required: true
        },
        onDelete: 'CASCADE'
      },
      updatedAt: { allowNull: false, type: DataTypes.DATEONLY, default: DataTypes.DATEONLY, field: 'updated_at' },
      createdAt: { allowNull: false, type: DataTypes.DATEONLY, default: DataTypes.DATEONLY, field: 'created_at' }
    })

    await queryInterface.createTable(RECORD_TABLE, {
      _id: { allowNull: false, autoIncrement: true, primaryKey: true, unique: true, type: DataTypes.INTEGER },
      amount: { allowNull: false, type: DataTypes.FLOAT },
      date: { allowNull: false, type: DataTypes.DATEONLY },
      note: { allowNull: false, type: DataTypes.STRING },
      sourceID: {
        field: 'source_id',
        allowNull: false,
        type: DataTypes.INTEGER,
        references: { model: FUND_TABLE, key: '_id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      targetID: {
        field: 'target_id',
        allowNull: false,
        type: DataTypes.INTEGER,
        references: { model: FUND_TABLE, key: '_id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      type: { allowNull: false, type: DataTypes.INTEGER },
      userID: {
        field: 'user_id',
        allowNull: false,
        type: DataTypes.INTEGER,
        references: { model: USER_TABLE, key: '_id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      }
    })
  }
};
