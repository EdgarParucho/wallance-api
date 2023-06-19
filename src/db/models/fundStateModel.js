const { Model, DataTypes, Sequelize } = require('sequelize');

const FUND_STATE_TABLE = "funds_states";
const { FUND_TABLE } = require('./fundModel');
const { RECORD_TABLE } = require('./recordModel');

const fundStateSchema = {
  id: {
    allowNull: false,
    primaryKey: true,
    unique: true,
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
  },
  recordID: {
    field: "record_id",
    references: { model: RECORD_TABLE, key: "id" },
    allowNull: false,
    type: DataTypes.UUID,
    unique: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  },
  fundID: {
    field: 'fund_id',
    allowNull: false,
    type: DataTypes.UUID,
    references: { model: FUND_TABLE, key: 'id' },
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  },
  recordDate: {
    field: "record_date",
    references: { model: RECORD_TABLE, key: 'date' },
    allowNull: false,
    type: DataTypes.DATE,
    unique: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  },
  balance: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      notNegative: ((balance) => {
        if (balance < 0) throw new Error("The record would lead to a negative balance in the fund.")
      })
    },
  },
}

class FundState extends Model {
  static associate(models) {
    this.belongsTo(models.Fund, { as: "fund", foreignKey: "id" });
    this.belongsTo(models.Record, { as: "record", foreignKey: "id" });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: FUND_STATE_TABLE,
      modelName: "FundState",
      createdAt: false,
      updatedAt: false,
    }
  }
}

module.exports = { FUND_STATE_TABLE, fundStateSchema, FundState };
