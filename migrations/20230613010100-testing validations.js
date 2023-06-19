'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn("funds_states", "balance", {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: {
          args: 0,
          msg: "This record would lead to a negative balance in the fund."
        }
      },
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn("funds_states", "balance", {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: {
          args: 0,
          msg: "This record would lead to a negative balance in the fund."
        }
      },
    })
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
