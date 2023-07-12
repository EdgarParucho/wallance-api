const { Model, DataTypes, Sequelize } = require('sequelize');

const boom = require('@hapi/boom');
const { USER_TABLE } = require('./userModel');
const { FUND_TABLE } = require('./fundModel');
const RECORD_TABLE = 'records';

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
    type: DataTypes.UUID,
    references: { model: USER_TABLE, key: 'id' },
    onDelete: 'CASCADE',
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
        if (this.type === 0 && value === null) throw boom.conflict("Both funds must be specified for assignments.")
      },
    }
  },
  date: {
    allowNull: false,
    type: DataTypes.DATE,
    validate: {
      notFutureDates: (date) => {
        const today = new Date();
        if (date > today) throw boom.conflict('Records in future date are not allowed.')
      }
    },
    required: true,
  },
  type: {
    allowNull: false,
    type: DataTypes.INTEGER,
    validate: {
      isIn: [
        [0, 1, 2]
      ]
    }
  },
  amount: {
    allowNull: false,
    type: DataTypes.FLOAT,
    validate: {
      isConsistentToType(value) {
        if (this.type === 1 && value < 1) throw boom.conflict("Amount must be positive on credits.")
        else if (this.type === 2 && value > -1) throw boom.conflict("Amount must be negative on debits.")
      }
    },
    required: true,
  },
  note: { type: DataTypes.STRING },
  tag: { type: DataTypes.STRING },
  createdAt: {
    field: "created_at",
    defaultValue: () => new Date(),
    type: DataTypes.DATE
  },
  updatedAt: {
    field: "updated_at",
    defaultValue: () => new Date(),
    type: DataTypes.DATE
  },
}

class Record extends Model {
  static associate(models) {
    this.belongsTo(models.User, { as: 'user', foreignKey: 'id' });
    this.belongsTo(models.Fund, { as: 'fund', foreignKey: 'id' });
    this.belongsTo(models.Fund, { as: 'otherFund', foreignKey: 'id' });
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
