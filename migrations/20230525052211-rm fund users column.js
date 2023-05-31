'use strict';

const { FUND_TABLE, fundSchema } = require('../src/db/models/fundModel');
const { RECORD_TABLE, recordSchema } = require('../src/db/models/recordModel');
const { USER_TABLE, userSchema } = require('../src/db/models/userModel');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // await queryInterface.removeColumn(FUND_TABLE, 'users');
    await queryInterface.renameColumn(FUND_TABLE, 'owner', 'user_id');
    await queryInterface.changeColumn(FUND_TABLE, 'userID', fundSchema.userID);
  },
  
  async down (queryInterface, Sequelize) {
    // await queryInterface.addColumn(FUND_TABLE, 'users', { allowNull: false, type: DataTypes.ARRAY(DataTypes.INTEGER) });
    await queryInterface.renameColumn(FUND_TABLE, 'userID', 'owner');
    await queryInterface.changeColumn(FUND_TABLE, 'owner', {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: USER_TABLE,
        key: '_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  }
};
