const { Model, DataTypes, Sequelize } = require('sequelize');

const { USER_TABLE } = require('./userModel');
const { FUND_TABLE } = require('./fundModel');
const RECORD_TABLE = 'records';

const recordSchema = {
  _id: { allowNull: false, primaryKey: true, unique: true, type: DataTypes.UUID, defaultValue: Sequelize.UUIDV4 },
  amount: { allowNull: false, type: DataTypes.FLOAT, validation: { min: 0 } },
  date: { allowNull: false, type: DataTypes.DATEONLY },
  note: { allowNull: false, type: DataTypes.STRING },
  sourceID: {
    field: 'source_id',
    allowNull: false,
    type: DataTypes.UUID,
    references: [
      { model: FUND_TABLE, key: '_id' },
      { model: USER_TABLE, key: 'credit_sources._id' },
    ],
    // ! try adding multiple references
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
}

class Record extends Model {
  static associate(models) {
    this.belongsTo(models.User, { as: 'user', foreignKey: '_id' });
    this.belongsTo(models.Fund, { as: 'source', foreignKey: '_id' });
    this.belongsTo(models.Fund, { as: 'target', foreignKey: '_id' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: RECORD_TABLE,
      modelName: 'Record'
    }
  }
}

module.exports = { RECORD_TABLE, recordSchema, Record };
