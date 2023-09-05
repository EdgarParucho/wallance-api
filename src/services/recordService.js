const { models } = require('../libs/sequelize');
const { Op } = require('sequelize');
const boom = require('@hapi/boom');

class RecordService {

  constructor() {}

  async find(userID) {
    const data = await models.Record.findAll({ where: { userID } });
    if (data.length === 0) throw boom.notFound('There are no records associated to the user.');
    return data;
  };

  async validateDateAvailability({ date, userID }) {
    const recordsOnDate = await models.Record.count({ where: { date, userID } });
    if (recordsOnDate > 0) throw boom.conflict(
      "You have a record at the same date-time combination. Please pick a different to avoid inconsistencies."
    )
    else return
  };

  async validateFundExistance({ id, userID }) {
    const fund = await models.Fund.findByPk(id);
    if (fund === null) throw boom.notFound("Could not find the requested Fund.")
    if (fund.dataValues.userID !== userID) throw boom.unauthorized("User is not authorized for this action.")
    return fund;
  };

  async getFundRecords({ fundID, excludingRecordID, transaction = null }) {
    const filters = {
      [Op.or]: [
        { fundID }, { otherFundID: fundID }
      ],
    };

    if (excludingRecordID) filters.id = { [Op.ne]: excludingRecordID };

    const fundRecords = await models.Record.findAll({
      where: filters,
      order: [
        ["date", "DESC"]
      ],
      attributes: ["id", "fundID", "date", "amount", "otherFundID"],
      raw: true,
      transaction
    });
    return fundRecords;
  };

  async validateBalanceConsistency({ fundID, userID }, { excludingRecordID, includingRecord }) {

    const fund = await this.validateFundExistance({ id: fundID, userID });
    const fundRecords = await this.getFundRecords({ fundID, excludingRecordID });

    if (includingRecord) fundRecords.push(includingRecord);
    fundRecords.sort((a, b) => a.date - b.date);

    fundRecords.reduce((accumulatedBalance, record) => {
      const recordAmount = (record.fundID === fundID) ? Number(record.amount) : -Number(record.amount);
      const resultingBalance = (accumulatedBalance + recordAmount);
      if (resultingBalance < 0) throw boom.conflict('The provided data would cause inconsistencies.' +
      `\nOn: ${new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(record.date)}, `+
      `fund's balance would be: ${Number(accumulatedBalance).toFixed(2) } to cover the record's amount: ${Number(record.amount).toFixed(2)}.`
      );
      return resultingBalance;
    }, 0)

    return
  };

  async findRecord({ id, userID }) {
    const record = await models.Record.findByPk(id);
    if (record === null) throw boom.notFound("Record not found.");
    if (record.dataValues.userID !== userID) throw boom.unauthorized("User is not authorized for this action.");
    return record;
  };

  async create(body) {

    body.date = new Date(body.date);
    body.date.setSeconds(1);

    await this.validateDateAvailability({ date: body.date, userID: body.userID });
    const fund = await this.validateFundExistance({ id: body.fundID, userID: body.userID });
    if (body.type === 1 && !fund.dataValues.isDefault) throw boom.conflict("Credits must be saved in default fund");
    if (body.type === 0) await this.validateFundExistance({
      id: body.otherFundID,
      userID: body.userID
    });

    if (body.type !== 1 && body.amount > 0) body.amount = -body.amount;
    else if (body.type === 1 && body.amount < 0) body.amount = -body.amount;

    if (body.type !== 1) await this.validateBalanceConsistency({
      fundID: body.fundID,
      userID: body.userID
    }, { includingRecord: body });

    return [await models.Record.create(body)];
  };

  async update({ id, body: updateEntries }, userID) {

    const record = await this.findRecord({ id, userID });
    const expectedRecord = { ...record.dataValues, ...updateEntries };

    if (expectedRecord.type !== 1 && expectedRecord.amount > 0) updateEntries.amount = -updateEntries.amount;
    else if (expectedRecord.type === 1 && expectedRecord.amount < 0) updateEntries.amount = -updateEntries.amount;

    if (expectedRecord.fundID === expectedRecord.otherFundID) throw boom.conflict(
      "Assignment funds (source and target) can't be equal."
    );

    if (updateEntries.date !== undefined) {
      updateEntries.date = new Date(updateEntries.date);
      updateEntries.date.setSeconds(1);
    }

    const updateKeys = Object
      .keys(updateEntries)
      .filter((key) => record.dataValues[key] !== updateEntries[key])

    if (updateKeys.length === 0) throw boom.badRequest("The provided values don't represent any change to originals.");
    if (updateEntries.date !== undefined) await this.validateDateAvailability({ date: updateEntries.date, userID });

    const sensitiveKeys = ["fundID", "otherFundID", "date", "type", "amount"];
    const updatingSensitiveKey = updateKeys.some(key => sensitiveKeys.includes(key));

    const recordIsAssignment = record.dataValues.type === 0;
    if (!updatingSensitiveKey) [await record.update(updateEntries)];

    await this.validateBalanceConsistency({
      fundID: expectedRecord.fundID,
      userID
    }, {
      includingRecord: expectedRecord,
      excludingRecordID: record.dataValues.id
    });

    if (recordIsAssignment) await this.validateBalanceConsistency({
      fundID: expectedRecord.otherFundID,
      userID
    }, {
      includingRecord: expectedRecord,
      excludingRecordID: record.dataValues.id,
    });

    if (updateKeys.includes("fundID") && expectedRecord.type === 1) await this.validateBalanceConsistency({
      fundID: record.dataValues.fundID,
      userID
    }, { excludingRecordID: record.dataValues.id });

    if (updateKeys.includes("otherFundID")) await this.validateBalanceConsistency({
      fundID: record.dataValues.otherFundID,
      userID
    }, { excludingRecordID: record.dataValues.id });

    return [await record.update(updateEntries, { returning: true })];
  };

  async delete ({ id, userID }) {

    const record = await this.findRecord({ id, userID });

    if (record.dataValues.type === 1) await this.validateBalanceConsistency({
      fundID: record.dataValues.fundID,
      userID
    }, { excludingRecordID: record.dataValues.id });

    if (record.dataValues.type === 0) await this.validateBalanceConsistency({
      fundID: record.dataValues.otherFundID,
      userID
    }, { excludingRecordID: record.dataValues.id });

    await record.destroy();
    return [record.dataValues.id];
  };

}

module.exports = RecordService;
