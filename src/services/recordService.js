const sequelize = require('../libs/sequelize');
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

  async validateDateAvailability({ date, userID, id }, { updating } = false) {

    const filters = { date, userID };
    if (updating) filters.id = { [Op.ne]: id, };

    const recordsOnDate = await models.Record.count({ where: filters });

    if (recordsOnDate > 0) throw boom.conflict(
      "You have a record at the same date-time combination. Please pick a different to avoid inconsistencies."
    )

    return
  };

  async validateFundExistance({ id, userID, transaction }) {
    const fund = await models.Fund.findByPk(id, { transaction });
    if (fund === null) throw boom.notFound("Could not find the requested Fund.")
    if (fund.dataValues.userID !== userID) throw boom.unauthorized("User is not authorized for this action.")
    return fund;
  };

  async getFundRecords({ fundID, transaction }) {
    const fundRecords = await models.Record.findAll({
      where: { fundID },
      order: [
        ["date", "DESC"]
      ],
      attributes: ["id", "date", "amount"],
      raw: true,
      transaction
    });
    return fundRecords;
  };

  validateFundsCorrelation({ expectedRecord }) {
    if (expectedRecord.fundID === expectedRecord.otherFundID) throw boom.conflict(
      "Assignment funds (source and target) can't be equal."
    );
    return
  };

  async validateBalanceAvailability({ fundID, userID }, { excludingID, includingRecord, transaction = null }) {

    await this.validateFundExistance({ id: fundID, userID, transaction });

    let fundRecords = await this.getFundRecords({ fundID, transaction });

    if (excludingID && fundRecords.length > 0) fundRecords = fundRecords.filter(record => record.id !== excludingID)
    if (includingRecord) fundRecords.push(includingRecord);
    fundRecords.sort((a, b) => a.date - b.date);

    fundRecords.reduce((accumulatedBalance, record) => {
      const resultingBalance = accumulatedBalance + record.amount;
      if (resultingBalance < 0) throw boom.conflict(
        `The provided data would cause inconsistencies:
          \nOn: ${record.date.toLocaleString()}, the accumulated balance would be: ${accumulatedBalance} to cover the record's amount: ${record.amount}.
        `
      );
      return resultingBalance;
    }, 0)

    return
  };

  async findRecord({ id, correlatedDate, fundID, userID }, { isCorrelated } = false) {

    if (!isCorrelated) {
      const record = await models.Record.findByPk(id);
      if (record === null) throw boom.notFound("Record not found.");
      if (record.dataValues.userID !== userID) throw boom.unauthorized("User is not authorized for this action.");
      return record;
    }

    correlatedDate.setSeconds(2);

    const correlatedRecord = await models.Record.findOne({
      where: { date: correlatedDate, fundID },
    });
    if (correlatedRecord === null) throw boom.notFound("Could not find the correlated record.");
    if (correlatedRecord.dataValues.userID !== userID) throw boom.unauthorized("User is not authorized for this action.");

    return correlatedRecord;
  };

  defineCorrelatedRecord({ baseData }) {

    const correlatedRecord = { ...baseData };
    const keys = Object.keys(baseData);

    if (keys.includes("amount")) correlatedRecord.amount = -baseData.amount;
    if (keys.includes("fundID")) correlatedRecord.otherFundID = baseData.fundID;
    if (keys.includes("otherFundID")) correlatedRecord.fundID = baseData.otherFundID;
    if (keys.includes("date")) {
      correlatedRecord.date = new Date(baseData.date);
      correlatedRecord.date.setSeconds(2);
    }

    return correlatedRecord;  
  };

  async create(body) {

    body.date = new Date(body.date);
    body.date.setSeconds(1);
    await this.validateDateAvailability(body);
    const fund = await this.validateFundExistance({ id: body.fundID, userID: body.userID });

    if (body.type === 1 && !fund.dataValues.isDefault) throw boom.conflict("Credits must be saved in the default fund");
    if (body.type === 1) return [await models.Record.create(body)];

    if (body.type !== 1) await this.validateBalanceAvailability({ fundID: body.fundID, userID: body.userID }, { includingRecord: body });
    if (body.type === 2) return [await models.Record.create(body)];
    
    if (body.amount > 0) throw boom.conflict("Amount must be provided in negative for assignment records.");
    await this.validateFundExistance({ id: body.otherFundID, userID: body.userID });

    const correlatedRecordBody = this.defineCorrelatedRecord({ baseData: body });

    const data = sequelize.transaction(async(transaction) => {
      const records = await models.Record.bulkCreate([
        body, correlatedRecordBody
      ], { validate: true, transaction });
      return records;
    });

    return data;
  };

  async update({ id, body: updateEntries }, userID) {

    const record = await this.findRecord({ id, userID });
    const correlatedRecord = record.dataValues.type !== 0 ? null : await this.findRecord({
      correlatedDate: new Date(record.dataValues.date),
      fundID: record.dataValues.otherFundID,
      userID
    }, { isCorrelated: true });

    if (record.dataValues.type !== 1 && updateEntries.amount > 0) throw boom.conflict(
      "Amount must be provided in negative for assignment, and debit records."
    );

    if (updateEntries.date !== undefined) {
      updateEntries.date = new Date(updateEntries.date);
      updateEntries.date.setSeconds(1);
      await this.validateDateAvailability({ date: updateEntries.date, userID, id }, { updating: true });
    }

    const updateKeys = Object
      .keys(updateEntries)
      .filter((key) => record.dataValues[key] !== updateEntries[key])

    if (updateKeys.length === 0) throw boom.badRequest(
      "The provided values didn't represent any change to originals."
    );

    const sensitiveKeys = ["fundID", "otherFundID", "date", "type", "amount"];
    const updatingSensitiveKey = updateKeys.some(key => sensitiveKeys.includes(key));

    this.validateFundsCorrelation({
      expectedRecord: { ...record.dataValues, ...updateEntries }
    });

    const data = sequelize.transaction(async(transaction) => {
      const recordIsAssignment = record.dataValues.type === 0;
      const correlatedUpdates = recordIsAssignment ? this.defineCorrelatedRecord({ baseData: updateEntries }) : null;

      if (!updatingSensitiveKey) {
        if (!recordIsAssignment) return [await record.update({ ...updateEntries }, { transaction })];

        const updatedRecord = await record.update({
          ...updateEntries
        }, { returning: true, transaction });
        const updatedCorrelated = await correlatedRecord.update({
          ...correlatedUpdates
        }, { returning: true, transaction });
        return [updatedRecord, updatedCorrelated];
      }

      await this.validateBalanceAvailability({
        fundID: updateEntries.fundID || record.dataValues.fundID,
        userID
      },
      {
        includingRecord: { ...record.dataValues, ...updateEntries },
        excludingID: record.dataValues.id, transaction
      });

      if (recordIsAssignment) await this.validateBalanceAvailability({
        fundID: correlatedUpdates.fundID || correlatedRecord.dataValues.fundID,
        userID
      }, {
        includingRecord: { ...correlatedRecord.dataValues, ...correlatedUpdates },
        excludingID: correlatedRecord.dataValues.id, transaction
      });

      if (updateKeys.includes("fundID")) await this.validateBalanceAvailability({
        fundID: record.dataValues.fundID,
        userID
      }, { excludingID: record.dataValues.id, transaction });

      if (updateKeys.includes("otherFundID")) await this.validateBalanceAvailability({
        fundID: record.dataValues.otherFundID,
        userID
      }, { excludingID: correlatedRecord.dataValues.id, transaction });
      
      const updatedRecord = await record.update(updateEntries, { returning: true, transaction });
      if (!recordIsAssignment) return [updatedRecord];

      const updatedCorrelated = await correlatedRecord.update(correlatedUpdates, { returning: true, transaction });
      return [updatedRecord, updatedCorrelated];
    });

    return data;
  };

  async delete ({ id, userID }) {

    const record = await this.findRecord({ id, userID });
    const correlatedRecord = record.dataValues.type !== 0 ? null : await this.findRecord({
      correlatedDate: new Date(record.dataValues.date),
      fundID: record.dataValues.otherFundID,
      userID
    }, { isCorrelated: true });

    const data = sequelize.transaction(async(transaction) => {

      if (record.dataValues.type === 1) await this.validateBalanceAvailability({
        fundID: record.dataValues.fundID,
        userID
      }, { excludingID: record.dataValues.id, transaction });

      const recordIsAssignment = record.dataValues.type === 0;

      await record.destroy({ transaction });
      if (!recordIsAssignment) return [record.dataValues.id];

      await this.validateBalanceAvailability({
        fundID: record.dataValues.otherFundID,
        userID
      }, { excludingID: correlatedRecord.dataValues.id, transaction });

      await correlatedRecord.destroy({ transaction });

      return [record.dataValues.id, correlatedRecord.dataValues.id];
    });

    return data;
  };

}

module.exports = RecordService;
