const sequelize = require('../libs/sequelize');
const { models } = require('../libs/sequelize');
const { Op } = require('sequelize');
const boom = require('@hapi/boom');

class RecordService {

  constructor() {}

  async find(userID) {

    const data = await models.Record.findAll({ where: { userID } })
    if (data.length === 0) throw boom.notFound('There are no records associated yet.');

    return data;
  }

  async findPreviousBalance({ fundID, recordDate }, transaction) {

    const previousState = await models.FundState.findOne({
      where: {
        fundID,
        recordDate: {
          [Op.lt]: recordDate
        },
      },
      order: [["recordDate", "DESC"]],
      attributes: ["balance"],
      transaction,
    });

    return previousState?.balance || 0;
  };

  updateRecordEffectOnStates({ amount, fundID, date }, { reversing = false, dateIsFormatted = true, transaction }) {
    return models.FundState.increment({
      balance: reversing ? -amount : amount,
    },
    {
      where: {
        fundID,
        recordDate: {
          [Op.gt]: dateIsFormatted ? date : new Date(date),
        }
      },
      transaction,
    })
      .then(([[fundStates]]) => {
        if (fundStates.some(state => state.balance < 0)) throw boom.conflict('The action affects consistency in the data: some fund would have a negative balance.');
      })  
  };

  async create(body) {

    const data = await sequelize.transaction(async (transaction) => {

      await this.updateRecordEffectOnStates(body, { dateIsFormatted: false, transaction });
      const record = await models.Record.create(body, { transaction });

      const previousBalance = await this.findPreviousBalance(
        { fundID: body.fundID, recordDate: new Date(body.date) },
        transaction,
      );

      const fundState = {
        recordDate: body.date,
        fundID: body.fundID,
        balance: (previousBalance + body.amount),
        recordID: record.id
      };
      await models.FundState.create(fundState, { transaction });

      return record;
    });

    return data;
  };

  async assign(body) {

    const data = sequelize.transaction(async(transaction) => {
      const sourceAssignmentRecord = {
        ...body,
        fundID: body.sourceID,
        date: new Date(body.date),
        amount: -body.amount,
      };
      const assignmentAddition = {
        ...body,
        fundID: body.targetID,
        date: new Date(body.date)
      };
      // The followings guarantees the required uniqueness for "record.date" and "fundState.recordDate" fields
      sourceAssignmentRecord.date.setSeconds(1);
      assignmentAddition.date.setSeconds(2);

      const records = await models.Record.bulkCreate(
        [sourceAssignmentRecord, assignmentAddition],
        { transaction }
      );

      const fundStates = [];

      for (const record of records) {

        await this.updateRecordEffectOnStates(record, { transaction });

        const previousBalance = await this.findPreviousBalance(
          { fundID: record.fundID, recordDate: record.date },
          transaction
        );

        const relatedState = {
          recordID: record.id,
          fundID: record.fundID,
          balance: (previousBalance + record.amount),
          recordDate: record.date
        };
        fundStates.push(relatedState);
      }

      await models.FundState.bulkCreate(fundStates, { transaction })
        .then((fundStates) => {
          if (fundStates.some(state => state.balance < 0)) throw boom.conflict('The action affects consistency in the data: some fund would have a negative balance.');
        })

      return records;
    });

    return data;  
  };

  findAssignmentCounterPart(recordA, recordAIsSubtraction, transaction) {
    const sharedDate = recordA.date;

    if (recordAIsSubtraction) sharedDate.setSeconds(2);
    else sharedDate.setSeconds(1);

    return models.Record.findOne({
      where: {
        date: sharedDate
      },
      transaction
    });
  };

  async updateAssignment(id, body) {
    const data = sequelize.transaction(async(transaction) => {

      const recordA = await models.Record.findByPk(id, { transaction });
      const recordAIsSubtraction = recordA.amount < 0;  
      const recordB = await this.findAssignmentCounterPart(recordA, recordAIsSubtraction, transaction);

      const assignmentSubtraction = {
        ...body,
        fundID: body.sourceID,
        date: new Date(body.date),
        amount: -body.amount,
      };
      const assignmentAddition = {
        ...body,
        fundID: body.targetID,
        date: new Date(body.date)
      };

      // The followings guarantees the required uniqueness for "record.date" and "fundState.recordDate" fields
      assignmentSubtraction.date.setSeconds(1);
      assignmentAddition.date.setSeconds(2);

      const assignmentRecords = [
        { originalValues: recordA, updateValues: assignmentSubtraction },
        { originalValues: recordB, updateValues: assignmentAddition },
      ];

      const updatedRecords = [];

      for (const assignmentRecord of assignmentRecords) {
        const { originalValues, updateValues } = assignmentRecord;
        await this.updateRecordEffectOnStates(originalValues, { reversing: true, transaction });

        const [, result] = await models.Record.update(
          updateValues,
          {
            where: { id: originalValues.id },
            returning: true,
            transaction,
          }
        );
        const [{ dataValues: updatedRecord}] = result;
        await this.updateRecordEffectOnStates(updatedRecord, { transaction });

        const previousBalance = await this.findPreviousBalance(
          { fundID: updateValues.fundID, recordDate: updateValues.date },
          transaction
        );

        const relatedState = {
          recordID: updatedRecord.id,
          fundID: updateValues.fundID,
          balance: (previousBalance + updateValues.amount),
          recordDate: updateValues.date
        };

        await models.FundState.update(relatedState, {
          where: { recordID: relatedState.recordID },
          transaction
        });
        updatedRecords.push(updatedRecord);
      }

      return updatedRecords;
    });

    return data;  
  };

  async update({ id, body }) {
    const updateKeys = Object.keys(body);
    const associationKeys = ["fundID", "date", "type", "amount"];

    const associationKeysToUpdate = updateKeys.filter(key => associationKeys.includes(key)).length;
    if (associationKeysToUpdate === 0) return await models.Record.update(body, { where: { id }, returning: true });

    const data = sequelize.transaction(async(transaction) => {

      const originalRecord = await models.Record.findByPk(id, { transaction });

      await this.updateRecordEffectOnStates(originalRecord, { reversing: true, transaction });

      const recordEffect = {
        amount: body.amount || originalRecord.amount,
        fundID: body.fundID || originalRecord.fundID,
        date: body.date ? new Date(body.date) : originalRecord.date,
      };

      await this.updateRecordEffectOnStates(recordEffect, { transaction });

      const previousBalance = await this.findPreviousBalance(
        {
          fundID: body.fundID || originalRecord.fundID,
          recordDate: body.date ? new Date(body.date) : originalRecord.date,
        },
        transaction,
      );

      await models.FundState.update({
        fundID: body.fundID,
        balance: previousBalance + (body.amount || originalRecord.amount),
        date: body.date,
      },
      {
        where : {
          recordID: id
        },
        transaction,
      });

      const record = await models.Record.update(body, { where: { id }, returning: true, transaction });
      return record;
    });

    return data;
  };

  async delete ({ id }) {
    const originalRecord = await models.Record.findByPk(id);

    sequelize.transaction(async(transaction) => {

      await this.updateRecordEffectOnStates(originalRecord, { reversing: true, transaction });
      await models.Record.destroy({ where: { id }, transaction });
      return
    });
    return id;
  };

  async deleteAssignment ({ id }) {
    const recordA = await models.Record.findByPk(id);
    const recordAIsSubtraction = recordA.amount < 0;  
    const recordB = await this.findAssignmentCounterPart(recordA, recordAIsSubtraction);
    if (recordA === null || recordB === null) throw boom.notFound();
    
    const data = sequelize.transaction(async(transaction) => {

      await this.updateRecordEffectOnStates(recordA, { reversing: true, transaction })
      await this.updateRecordEffectOnStates(recordB, { reversing: true, transaction })
      const deletedRecords = await models.Record.destroy({
        where: {
          id: {
            [Op.or]: [recordA.id, recordB.id]
          }
        },
        transaction
      });
      // await models.Record.destroy({ where: { id: recordB.id }, transaction });

      return deletedRecords;
    });
    return data;
  };
  
}

module.exports = RecordService;
