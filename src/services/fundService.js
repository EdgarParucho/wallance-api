const boom = require('@hapi/boom')
const { models } = require('../libs/sequelize');
const { Op } = require('sequelize');
const sequelize = require('../libs/sequelize');

const { Fund, Record } = models;

const RecordService = require('./recordService');
const recordService = new RecordService();

class FundService {

  constructor() {}

  async create(body) {
    const data = await Fund.create(body);
    return data;
  };

  async update(userID, id, body) {
    const response = await Fund.update(body, { where: { id, userID }, returning: true });
    const [totalAffectedRows, affectedRows] = response;
    if (totalAffectedRows < 1) throw boom.notFound('Fund not found.');

    const [data] = affectedRows;
    return data;
  };

  async delete({ userID, id }) {

    const data = sequelize.transaction(async(transaction) => {

      const deletingFund = await Fund.findByPk(id, { transaction });
      if (deletingFund === null) throw boom.notFound('Fund not found.');
      if (deletingFund.userID !== userID) throw boom.forbidden("User is not authorized to update this fund.");
      if (deletingFund.isDefault) throw boom.conflict('Cannot delete the default fund.');
      
      const fundRecords = await recordService.getFundRecords({ fundID: id, transaction });
      const fundBalance = fundRecords.reduce((accumulatedBalance, record) => {
        const resultingBalance = accumulatedBalance + record.amount;
        return resultingBalance;
      }, 0);
  
      if (fundBalance > 0) throw boom.conflict('Cannot delete a fund with positive balance.');

      const defaultFund = await Fund.findOne({ where: { userID, isDefault: true }, raw: true, transaction })
      const deletingOrDefaultFund = { [Op.or]: [defaultFund.id, id] };

      await Record.destroy({
        where: {
          fundID: deletingOrDefaultFund,
          otherFundID: deletingOrDefaultFund
        },
        transaction,
      });

      await Record.update({ fundID: defaultFund.id }, { where: { fundID: id }, transaction, });
      await Record.update({ otherFundID: defaultFund.id }, { where: { otherFundID: id }, transaction, });

      await deletingFund.destroy({ transaction });
      return id;
    });

    return data;
  };

};

module.exports = FundService;
