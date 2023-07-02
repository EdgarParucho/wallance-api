const { User, userSchema } = require('./userModel');
const { Record, recordSchema } = require('./recordModel');
const { Fund, fundSchema } = require('./fundModel');
const { FundState, fundStateSchema } = require('./fundStateModel');

function setupModels(sequelize) {
  User.init(userSchema, User.config(sequelize));
  Record.init(recordSchema, Record.config(sequelize));
  Fund.init(fundSchema, Fund.config(sequelize));
  // FundState.init(fundStateSchema, FundState.config(sequelize));
  User.associate(sequelize.models);
  Fund.associate(sequelize.models);
  // FundState.associate(sequelize.models);
  Record.associate(sequelize.models);
}

module.exports = setupModels;
