const boom = require('@hapi/boom')
const { models } = require('../libs/sequelize');
const { Op } = require('sequelize');

const { Fund, Record } = models;

class FundService {

  constructor() {
  }

  async create(body) {
    const data = await Fund.create(body);
    return data;
  }

  async update(userID, id, body) {
    const response = await Fund.update({ ...body }, { where: { id, userID }, returning: true });

    const [totalAffectedRows, affectedRows] = response;
    if (totalAffectedRows < 1) throw boom.notFound('Could not found the record to update.');

    const [data] = affectedRows;
    return data;
  }

  async delete({ userID, fundID, defaultFundID }) {
    const deletingFund = await Fund.findByPk(fundID);

    if (deletingFund === null) throw boom.notFound('Fund not found.');
    if (deletingFund.userID !== userID) throw boom.forbidden("User is not authorized to update this fund.");
    if (deletingFund.isDefault) throw boom.conflict('Cannot delete the default fund.');
    if (deletingFund.balance > 0) throw boom.conflict('Cannot delete a fund with positive balance.');

    const relatedToDeletingFund = { [Op.or]: [{ sourceID: fundID }, { targetID: fundID }] };
    const relatedToDefaultFund = { [Op.or]: [{ sourceID: defaultFundID }, { targetID: defaultFundID }] };

    // * https://wallance.atlassian.net/browse/WAL-51
    await Record.destroy({ where: { [Op.and]: [relatedToDeletingFund, relatedToDefaultFund] } });
    await Record.update({ targetID: defaultFundID }, { where: { targetID: fundID }, [Op.not]: { sourceID: defaultFundID } });
    await Record.update({ sourceID: defaultFundID }, { where: { sourceID: fundID }, [Op.not]: { targetID: defaultFundID } });
    await deletingFund.destroy();

    return fundID;
  }

}

module.exports = FundService;
