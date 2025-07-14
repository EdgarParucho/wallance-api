const { Sequelize, Model, DataTypes } = require('sequelize');

const { FUND_TABLE } = require('./fundModel');
const RECORD_TABLE = 'records';
const CustomError = require('../utils/customError');

const recordSchema = {
  id: {
    allowNull: false,
    primaryKey: true,
    unique: true,
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    required: true,
  },
  userID: {
    field: 'user_id',
    allowNull: false,
    type: DataTypes.STRING,
    required: true
  },
  fundID: {
    field: 'fund_id',
    allowNull: false,
    type: DataTypes.UUID,
    references: { model: FUND_TABLE, key: 'id' },
  },
  otherFundID: {
    field: "other_fund_id",
    type: DataTypes.UUID,
    allowNull: true,
    defaultValue: null,
    references: { model: FUND_TABLE, key: "id" },
    validate: {
      requiredInAssignments: (value) => {
        if (this.type === 0 && value === null) throw new CustomError(409, "Both funds must be specified for assignments.")
      },
      differsFromFundID: (value) => {
        if (value === this.fundID) throw new CustomError(409, "Source and target funds can't be equal.");
      }
    }
  },
  date: {
    allowNull: false,
    type: DataTypes.DATE,
    required: true,
  },
  type: {
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  amount: {
    allowNull: false,
    type: DataTypes.FLOAT,
    validate: {
      isConsistentToType(value) {
        if (this.type === 1 && value < 0) throw new CustomError(409, "Amount must be positive on credits.")
        else if (this.type !== 1 && value > 0) throw new CustomError(409, "Amount must be negative on debits.")
      }
    },
    required: true,
  },
  note: { type: DataTypes.STRING },
  tag: { type: DataTypes.STRING }
}

class Record extends Model {
  static associate(models) {
    this.belongsTo(models.Fund, { as: 'fund', foreignKey: 'id' });
    this.belongsTo(models.Fund, { as: 'otherFund', foreignKey: 'id' });
  }

  static config(sequelize) {
    return {
      sequelize,
      tableName: RECORD_TABLE,
      modelName: 'Record',
      createdAt: false,
      updatedAt: false,
    }
  }
}

module.exports = { RECORD_TABLE, recordSchema, Record };
