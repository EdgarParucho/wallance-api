const { DataTypes, Sequelize, Model } = require('sequelize');
const { USER_TABLE } = require('./userModel');
const FUND_TABLE = 'funds';

const fundSchema = {
  _id: { allowNull: false, primaryKey: true, unique: true, type: DataTypes.UUID, defaultValue: Sequelize.UUIDV4 },
  balance: { allowNull: false, type: DataTypes.FLOAT, defaultValue: 0, validate: { min: 0 } },
  name: { allowNull: false, type: DataTypes.STRING },
  description: { allowNull: false, type: DataTypes.STRING },
  isDefault: { allowNull: false, type: DataTypes.BOOLEAN, field: 'is_default' },
  userID: {
    field: 'user_id',
    allowNull: false,
    type: DataTypes.UUID,
    references: {
      model: USER_TABLE,
      key: '_id',
      required: true
    },
    onDelete: 'CASCADE'
  },
}

class Fund extends Model {
  static associate(models) {
    this.belongsTo(models.User, { as: 'user', foreignKey: 'userID' });
    this.hasMany(models.Record, { as: 'source', foreignKey: 'sourceID' })
    this.hasMany(models.Record, { as: 'target', foreignKey: 'targetID' })
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: FUND_TABLE,
      modelName: 'Fund',
      createdAt: false,
      updatedAt: false,
    }
  }
}

module.exports = { FUND_TABLE, fundSchema, Fund };
