const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');
const sequelize = require('../libs/sequelize');
const { Op } = require('sequelize');

class RecordService {

  constructor() {}

  async findPreviousBalance(fundID, date, transaction = null) {

    const previousState = await models.FundState.findOne({
      where: { fundID, recordDate: { [Op.lt]: date } },
      order: [["recordDate", "DESC"]],
      transaction,
      attributes: ["balance"]
    });

    return previousState?.balance || 0;
  }

  async create(body, next) {
    const newRecordDate = new Date(body.date);
    const t = await sequelize.transaction();
    
    try {
      const previousBalance = await this.findPreviousBalance(body.fundID, newRecordDate, t);
      
      await models.FundState.increment(
        { balance: body.amount },
        {
          where: {
            recordDate: { [Op.gt]: newRecordDate },
            fundID: body.fundID
          },
          transaction: t
        },
      )
        .then(([[fundStates]]) => {
          if (fundStates.some(fundState => fundState.balance < 0)) {
            next(new Error("This record would lead to a negative balance in the fund."))
          }
        })
      
      const newRecord = await models.Record.create(body, { transaction: t });
      const newFundState = {
        recordDate: body.date,
        fundID: body.fundID,
        balance: previousBalance + body.amount,
        recordID: newRecord.id
      };
      console.log(newFundState);
      console.log("\nis the next \n");
      await models.FundState.create(newFundState, { transaction: t });

      t.commit()
      return newRecord
    } catch (error) {
      await t.rollback();      
      throw boom.internal(error)
    }
  }

  async assign(body, next) {
    // ! Refactor, rename, modularize
    const { sourceID, targetID } = body;
    delete body.sourceID;
    delete body.targetID;
    const targetAssignmentDate = new Date(body.date);
    targetAssignmentDate.setSeconds(1);
    const sourcePreviousState = await this.findPreviousBalance(sourceID, targetAssignmentDate);
    const targetPreviousState = await this.findPreviousBalance(targetID, targetAssignmentDate);
    const t = await sequelize.transaction();

    try {
      const sourceAssignment = { ...body, fundID: sourceID, amount: body.amount * -1 };
      const targetAssignment = { ...body, fundID: targetID, date: targetAssignmentDate };
      const newRecords = await models.Record.bulkCreate(
        [sourceAssignment, targetAssignment],
        { transaction: t, validate: true }
      );

      await models.FundState.increment(
        { balance: sourceAssignment.amount },
        {
          where: {
            recordDate: { [Op.gt]: targetAssignmentDate },
            fundID: sourceAssignment.fundID
          },
          transaction: t
        },
      )
        .then(([[fundStates]]) => {
          if (fundStates.some(fundState => fundState.balance < 0)) throw new Error("This record would lead to a negative balance in the fund.")
        })

      await models.FundState.increment(
        { balance: targetAssignment.amount },
        {
          where: {
            recordDate: { [Op.gt]: targetAssignmentDate },
            fundID: targetAssignment.fundID
          },
          transaction: t
        },
      )
        .then(([[fundStates]]) => {
          if (fundStates.some(fundState => fundState.balance < 0)) throw new Error("This record would lead to a negative balance in the fund.")
        })
      
      const sourceNewFundState = {
        recordID: newRecords[0].id,
        fundID: sourceAssignment.fundID,
        balance: (sourcePreviousState?.balance || 0) + sourceAssignment.amount,
        recordDate: sourceAssignment.date,
      };  
      const targetNewFundState = {
        recordID: newRecords[1].id,
        fundID: targetAssignment.fundID,
        balance: (targetPreviousState?.balance || 0) + targetAssignment.amount,
        recordDate: targetAssignment.date,
      };  
      await models.FundState.bulkCreate(
        [sourceNewFundState, targetNewFundState],
        { validate: true, transaction: t }
      );
      
      t.commit();
      return newRecords;
    } catch (error) {
      await t.rollback();      
      next(error)
    }
  };

  async find(userID) {
    const data = await models.Record.findAll({ where: { userID } })
    if (data.length === 0) throw boom.notFound('There are no records associated yet.');
    return data;
  }

  async update(params, next) {
    // ! Fund not found is not being handled
    // You must validate if the values have actually changed, not just checking if received
    // Error handling proper codes.

    const { id, body } = params;
    const updateKeys = Object.keys(body);
    const associationKeys = ["fundID", "date", "type", "amount"];

    const updateIncludesAssociationKeys = updateKeys.some(key => associationKeys.includes(key))
    if (!updateIncludesAssociationKeys) return await models.Record.update(body, { where: { id }, returning: true });

    const originalRecord = await models.Record.findByPk(id);

    // * Use a single managed transaction
    const t = await sequelize.transaction();
    try {

      if (updateKeys.includes("date")) {

        const newDate = new Date(body.date);

        if (newDate > originalRecord.date) {

          // updateStatesAhead
          await models.FundState.increment(
            { balance: -originalRecord.amount },
            {
              where: {
                recordDate: {
                  [Op.gt]: originalRecord.date,
                  [Op.lt]: newDate,
                },
                fundID: originalRecord.fundID
              },
              transaction: t
            }
          )
            .then(([[fundStates]]) => {
              if (fundStates.some(fundState => fundState.balance < 0)) throw new Error(
                "This record would lead to a negative balance in the fund."
              )
            })

          const previousBalance = await this.findPreviousBalance(originalRecord.fundID, newDate, t);

          const data = await models.Record.update(body, { where: { id }, returning: true, transaction: t });
          await models.FundState.update(
            {
              balance: previousBalance + originalRecord.amount,
              recordDate: newDate
            },
            {
              where: {
                recordID: id,
              },
              transaction: t
            }
          )
          await t.commit();
          return data;
        } else {
          await models.FundState.increment(
            { balance: originalRecord.amount },
            {
              where: {
                recordDate: {
                  [Op.gt]: newDate,
                  [Op.lt]: originalRecord.date,
                },
                fundID: originalRecord.fundID,
              },
              transaction: t
            }
          )
            .then(([[fundStates]]) => {
              if (fundStates.some(fundState => fundState.balance < 0)) throw new Error("This record would lead to a negative balance in the fund.")
            })

          const previousBalance = await this.findPreviousBalance(originalRecord.fundID, newDate, t);
          const data = await models.Record.update(body, { where: { id }, returning: true, transaction: t });
          await models.FundState.update(
            {
              balance: previousBalance + originalRecord.amount,
              recordDate: newDate
            },
            {
              where: {
                recordID: id,
              },
              transaction: t
            }
          )
          await t.commit();
          return data;
        }
      }
    
      if (updateKeys.includes("amount")) {
        const difference = body.amount - originalRecord.amount;
        const data = await sequelize.transaction(async(transaction) => {

          await models.FundState.increment(
            { balance: difference },
            {
              transaction,
              where: {
                recordDate: {
                  [Op.gte]: originalRecord.date
                },
                fundID: originalRecord.fundID,
              },
            }
          )
            .then(([[fundStates]]) => {
              if (fundStates.some(fundState => fundState.balance < 0)) throw new Error("This record would lead to a negative balance in the fund.")
            })

          const record = await models.Record.update({ ...body }, { where: { id }, returning: true, transaction });

          return record;
        });
        return data
      }

      if (updateKeys.includes("fundID")) {
        const data = await sequelize.transaction(async(transaction) => {

          await models.FundState.increment(
            { balance: originalRecord.amount },
            {
              transaction,
              where: {
                recordDate: {
                  [Op.gt]: originalRecord.date
                },
                fundID: body.fundID
              }
            }
          )
            .then(([[fundStates]]) => {
              if (fundStates.some(fundState => fundState.balance < 0)) throw new Error(
                "This record would lead to a negative balance in the fund."
              )
              else return fundStates
            })

          await models.FundState.increment(
            { balance: -originalRecord.amount },
            {
              where: {
                recordDate: {
                  [Op.gt]: originalRecord.date
                },
                fundID: originalRecord.fundID
              },
              transaction,
            }
          )
            .then(([[fundStates]]) => {
              if (fundStates.some(fundState => fundState.balance < 0)) throw new Error(
                "This record would lead to a negative balance in the fund."
              )
              else return fundStates
            })
  
            const previousBalance = await this.findPreviousBalance(body.fundID, originalRecord.date, transaction);
            await models.FundState.update(
              {
                fundID: body.fundID,
                balance: previousBalance + originalRecord.amount
              },
              {
                where : {
                  recordID: originalRecord.id
                },
                transaction,
              }
            )
  
            const [,[record]] = await models.Record.update(
            { fundID: body.fundID },
            {
              where: { id: originalRecord.id },
              transaction,
              returning: true
            }
          );

          return record;
        })
        return data;
      }

      if (updateKeys.includes("type")) {
        // 1. Increment (amount * -2) the fund states ahead in timeline.
        const data = await sequelize.transaction(async(transaction) => {
          
          await models.FundState.increment(
            { balance: originalRecord.amount * -2},
            {
              where: {
                recordDate: {
                  [Op.gte]: originalRecord.date
                },
                fundID: originalRecord.fundID
              },
              transaction
            }
          )
            .then(([[fundStates]]) => {
              if (fundStates.some(fundState => fundState.balance < 0)) throw new Error(
                "Changes affect the timeline's consistency, one or more records wouldn't been able to satisfy."
              )
            })
          
          const [,[record]] = await models.Record.update(
            { type: body.type, amount: originalRecord.amount * -1 },
            {
              where: { id },
              returning: true,
              transaction,
              validate: true
            }
          )
          return record
        })
        return data;  
      }
    } catch (error) {
      await t.rollback();
      next(error);
    }
  }
}

  // async delete ({ userID, id }) {
  //   const response = await models.Record.destroy({ where: { id, userID } });
  //   if(response === 0) throw boom.notFound('Could not found the record to delete.');
  //   return recordID;
  // }

module.exports = RecordService;
