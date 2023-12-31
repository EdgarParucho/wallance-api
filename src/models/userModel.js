const { Model, Sequelize, DataTypes } = require('sequelize');

const USER_TABLE = 'users';

const userSchema = {
  id: {
    allowNull: false,
    primaryKey: true,
    unique: true,
    type: DataTypes.STRING,
  },
  preferences: {
    type: DataTypes.JSONB,
    defaultValue: {
      darkMode: false,
      templates: [],
      queries: [],
      FirstStepsStatus: ["Active", "Active", "Active"],
      language: "en"
    }
  }
}

class User extends Model{
  static associate(models) {
    this.hasMany(models.Fund, { as: 'funds', foreignKey: 'userID' })
    this.hasMany(models.Record, { as: 'records', foreignKey: 'userID' })
  }
  static config(sequelize) {
    return {
      sequelize,
      tableName: USER_TABLE,
      modelName: 'User',
      timeStamps: false,
      createdAt: false,
      updatedAt: false
    }
  }
}

module.exports = { USER_TABLE, userSchema, User };
