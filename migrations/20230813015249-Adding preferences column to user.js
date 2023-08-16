'use strict';

const { DataTypes } = require("sequelize");
const { USER_TABLE } = require("../src/db/models/userModel");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn(USER_TABLE, "preferences", {
      type: DataTypes.JSONB,
      defaultValue: {
        theme: "dark",
        records: [],
        queries: []
      }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn(USER_TABLE, "preferences")
  }
};
