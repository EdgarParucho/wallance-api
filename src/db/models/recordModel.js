const { Model, DataTypes, Sequelize } = require('sequelize');

const { USER_TABLE } = require('./userModel');
const { FUND_TABLE } = require('./fundModel');
const RECORD_TABLE = 'records';

const recordSchema = {
  id: {
    allowNull: false,
    primaryKey: true,
    unique: true,
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4
  },
  userID: {
    field: 'user_id',
    allowNull: false,
    type: DataTypes.UUID,
    references: { model: USER_TABLE, key: 'id' },
    required: true,
    onDelete: 'CASCADE',
  },
  fundID: {
    field: 'fund_id',
    allowNull: false,
    type: DataTypes.UUID,
    references: { model: FUND_TABLE, key: 'id' },
  },
  date: {
    allowNull: false,
    type: DataTypes.DATE,
    unique: true,
    validate: {
      custom: (date) => {
        const today = new Date();
        if (date > today) throw new Error ('Records in future date are not allowed.')
      }
    },
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
        if (this.type === 1 && value < 1) throw new Error("Amount must be positive on credits.")
        else if (this.type === 2 && value > -1) throw new Error("Amount must be negative on debits.")
      }
    }
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
    this.hasOne(models.FundState, { as: 'fundState', foreignKey: 'recordDate' });
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
