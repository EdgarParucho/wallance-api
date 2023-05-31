const { Model, Sequelize, DataTypes } = require('sequelize');

const USER_TABLE = 'users';

const userSchema = {
  _id: { allowNull: false, primaryKey: true, unique: true, type: DataTypes.UUID, defaultValue: Sequelize.UUIDV4 },
  email: { allowNull: false, type: DataTypes.STRING, unique: true },
  password: { allowNull: false, type: DataTypes.STRING },
  creditSources: { allowNull: false, type: DataTypes.JSON, field: 'credit_sources' }
}

class User extends Model{
  static associate(models) {
    /* 1 to 1 Example:
      this.belongsTo(Model, Options);
      this.belongsTo(models.OtherModel, { as: 'OptionalAlias' });
    */
    this.hasMany(models.Fund, { as: 'funds', foreignKey: 'userID' })
    this.hasMany(models.Record, { as: 'records', foreignKey: 'user_id' })
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
