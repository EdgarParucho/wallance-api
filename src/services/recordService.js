const { Op } = require('sequelize');
const sequelize = require('../dataAccess/sequelize');
const CustomError = require('../utils/customError.js');
const normalizeQuery = require('../utils/normalizeQuery.js');

const { Fund, Record } = sequelize.models;

class RecordService {

  constructor() {}

  async find(filters) {
    normalizeQuery(filters);
    const data = await Record.findAll({
      where: filters,
      attributes: { exclude: ['createdAt', 'updatedAt', 'userID'] },
      raw: true,
    });
    return data;
  };

  async validateDateAvailability({ date, userID, id = null }) {
    const filters = { date, userID };
    if (id) filters.id = { [Op.not]: id };
    const recordsOnDate = await Record.count({ where: filters });
    if (recordsOnDate > 0) throw new CustomError(409, "You have a record at the same date-time. Please pick another to avoid inconsistencies.");
    else return;
  };

  async validateFund({ id, userID }) {
    const fund = await Fund.findByPk(id);
    if (fund === null) throw new CustomError(404, "The requested fund wasn't found.");
    if (fund.dataValues.userID !== userID) throw new CustomError(403, "User is not authorized for this action.");
    return fund;
  };

  async getFundRecords({ fundID, excludingRecordID, transaction = null }) {
    const filters = {
      [Op.or]: [
        { fundID },
        { otherFundID: fundID }
      ],
    };

    if (excludingRecordID) filters.id = { [Op.ne]: excludingRecordID };

    const fundRecords = await Record.findAll({
      where: filters,
      order: [["date", "DESC"]],
      attributes: ["id", "fundID", "date", "amount", "otherFundID"],
      raw: true,
      transaction
    });
    return fundRecords;
  };

  async updateBalance({ fundID, userID }, { excludingRecordID, includingRecord, transaction }) {

    const fundRecords = await this.getFundRecords({ fundID, excludingRecordID, transaction });

    if (includingRecord) fundRecords.push(includingRecord);
    fundRecords.sort((a, b) => new Date(a.date) - new Date(b.date));

    const fundBalance = fundRecords.reduce((accumulatedBalance, record) => {
      const recordAmount = (record.fundID === fundID) ? Number(record.amount) : -Number(record.amount);
      const resultingBalance = (accumulatedBalance + recordAmount);

      if (resultingBalance < 0) throw new CustomError(409, "The provided data would cause inconsistencies." +
      `\nOn: ${new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(record.date)}, `+
      `fund's balance would be: ${Number(accumulatedBalance).toFixed(2) } to cover the record's amount: ${Number(record.amount).toFixed(2)}.`
      );

      return resultingBalance;
    }, 0);

    const updatedFund = Fund.update({ balance: fundBalance}, { where: { id: fundID, userID }, transaction, returning: true, plain: true })
      .then(result => {
        const raw = result[1].dataValues;
        delete raw.userID
        return raw;
      });
    return updatedFund;
  };

  async findRecord({ id, userID }) {
    const record = await Record.findByPk(id);
    if (record === null) throw new CustomError(404, "Couldn't find the requested record.");
    if (record.dataValues.userID !== userID) throw new CustomError(403, "User is not authorized for this action.");
    return record;
  };

  async create(body) {

    body.date = new Date(body.date);
    body.date.setSeconds(1);

    await this.validateDateAvailability({ date: body.date, userID: body.userID });
    const fund = await this.validateFund({ id: body.fundID, userID: body.userID });
    if (body.type === 1 && !fund.dataValues.isDefault) throw new CustomError(409, "Credits must be saved in default fund.");
    if (body.type === 0) await this.validateFund({
      id: body.otherFundID,
      userID: body.userID
    });

    const data = await sequelize.transaction(async(transaction) => {
      const updatedFunds = [];

      updatedFunds.push(await this.updateBalance({
        fundID: body.fundID,
        userID: body.userID
      }, { includingRecord: body, transaction }));

      if (body.type === 0) updatedFunds.push(await this.updateBalance({
        fundID: body.otherFundID,
        userID: body.userID
      }, { includingRecord: body, transaction }));

      const record = await Record.create(body, { transaction, returning: true, plain: true })
        .then(result => {
          const raw = result.dataValues;
          delete raw.userID
          return raw;
        });

      return { record, funds: updatedFunds };
    });

    return data;
  };

  async update({ id, updateEntries, userID }) {

    const record = await this.findRecord({ id, userID });
    const expectedRecord = { ...record.dataValues, ...updateEntries };

    if (expectedRecord.type !== 1 && expectedRecord.amount > 0) updateEntries.amount = -updateEntries.amount;
    else if (expectedRecord.type === 1 && expectedRecord.amount < 0) updateEntries.amount = -updateEntries.amount;

    if (expectedRecord.fundID === expectedRecord.otherFundID) throw new CustomError(409, "Assignment funds (source and target) can't be equal.");

    if (updateEntries.date !== undefined) {
      updateEntries.date = new Date(updateEntries.date);
      updateEntries.date.setSeconds(1);
    }

    const updateKeys = Object
      .keys(updateEntries)
      .filter((key) => record.dataValues[key] !== updateEntries[key])

    if (updateKeys.length === 0) throw new CustomError(400, "The provided values don't represent any change to originals.");
    if (updateEntries.date !== undefined) await this.validateDateAvailability({ date: updateEntries.date, userID, id });

    const sensitiveKeys = ["fundID", "otherFundID", "date", "type", "amount"];
    const updatingSensitiveKey = updateKeys.some(key => sensitiveKeys.includes(key));

    const recordIsAssignment = record.dataValues.type === 0;
    if (!updatingSensitiveKey) [await record.update(updateEntries)];

    const data = await sequelize.transaction(async(transaction) => {
      const updatedFunds = [];
      updatedFunds.push(await this.updateBalance({
        fundID: expectedRecord.fundID,
        userID
      }, {
        includingRecord: expectedRecord,
        excludingRecordID: record.dataValues.id,
        transaction,
      }));

      if (recordIsAssignment) updatedFunds.push(await this.updateBalance({
        fundID: expectedRecord.otherFundID,
        userID
      }, {
        includingRecord: expectedRecord,
        excludingRecordID: record.dataValues.id,
        transaction,
      }));

      if (updateKeys.includes("fundID")) updatedFunds.push(await this.updateBalance({
        fundID: record.dataValues.fundID,
        userID
      }, { excludingRecordID: record.dataValues.id, transaction }));

      if (updateKeys.includes("otherFundID")) updatedFunds.push(await this.updateBalance({
        fundID: record.dataValues.otherFundID,
        userID
      }, { excludingRecordID: record.dataValues.id, transaction }));

      const updatedRecord = await record.update(updateEntries, { transaction, returning: true, plain: true })
        .then(result => {
          const resultData = result.dataValues;
          delete resultData.userID
          return resultData;
        });

      return { record: updatedRecord, funds: updatedFunds };
    });
    return data;
  };

  async delete ({ id, userID }) {
    const record = await this.findRecord({ id, userID });
    const data = await sequelize.transaction(async(transaction) => {
      const updatedFunds = [];
      updatedFunds.push(await this.updateBalance({
        fundID: record.dataValues.fundID,
        userID
      }, { excludingRecordID: record.dataValues.id, transaction }));
  
      if (record.dataValues.type === 0) updatedFunds.push(await this.updateBalance({
        fundID: record.dataValues.otherFundID,
        userID
      }, { excludingRecordID: record.dataValues.id, transaction }));

      await record.destroy({ transaction });

      return { record: { id }, funds: updatedFunds };
    });

    return data;
  };

}

module.exports = RecordService;
