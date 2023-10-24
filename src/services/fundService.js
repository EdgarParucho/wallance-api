const boom = require('@hapi/boom')
const { models } = require('../libs/sequelize');
const { Op } = require('sequelize');
const sequelize = require('../libs/sequelize');

const { Fund, Record } = models;

const RecordService = require('./recordService');
const recordService = new RecordService();

class FundService {

  constructor() {}

  async find(userID) {
    const data = await Fund.findAll({ where: { userID }, attributes: { exclude: 'userID' }, raw: true });
    if (data.length === 0) throw boom.notFound('There are no funds associated to the user.');
    return data;
  };

  async create(body) {
    const data = await Fund.create({ ...body, isDefault: false });
    delete data.dataValues.userID;
    return data;
  };

  async update(userID, id, body) {
    const fund = await Fund.findByPk(id);
    if (fund === null) throw boom.notFound("The requested fund wasn't found.")
    if (fund.dataValues.userID !== userID) throw boom.unauthorized("User is not authorized for this action");
    const data = await fund.update(body);
    delete data.dataValues.userID;
    return data;
  };

  async delete({ userID, id }) {

    const data = sequelize.transaction(async(transaction) => {

      const deletingFund = await Fund.findByPk(id, { transaction });
      if (deletingFund === null) throw boom.notFound('Fund not found.');
      if (deletingFund.dataValues.userID !== userID) throw boom.unauthorized("User is not authorized to update this fund.");
      if (deletingFund.dataValues.isDefault) throw boom.conflict('Cannot delete the default fund.');
      if (deletingFund.balance > 0) throw boom.conflict('Cannot delete a fund with positive balance.');

      const defaultFund = await Fund.findOne({ where: { userID, isDefault: true }, raw: true, transaction })

      await Record.destroy({
        where: {
          fundID: {
            [Op.or]: [defaultFund.id, deletingFund.dataValues.id]
          },
          otherFundID: {
            [Op.or]: [defaultFund.id, deletingFund.dataValues.id]
          }
        },
        transaction,
      });

      await Record.update({
        fundID: defaultFund.id
      }, { where: { fundID: deletingFund.dataValues.id }, transaction, });

      await Record.update({
        otherFundID: defaultFund.id
      }, { where: { otherFundID: deletingFund.dataValues.id }, transaction, });

      await recordService.updateBalance({ fundID: defaultFund.id, userID }, { transaction });
      await deletingFund.destroy({ transaction });
      return id;
    });

    return data;
  };

};

module.exports = FundService;
