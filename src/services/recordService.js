const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');

class RecordService {

  constructor() {
  }

  async create(body) {
    const data = await models.Record.create(body);
    return data;
  }

  async find(userID) {
    const data = await models.Record.findAll({ where: { userID  } })
    if (data.length === 0) throw boom.notFound('There are no records associated yet.');
    return data;
  }

  async update(params) {
    const { userID, _id, body } = params;
    const response = await models.Record.update(body, { where: { _id, userID }, returning: true });
    const [totalAffectedRows, [data]] = response;
    if (totalAffectedRows < 1) throw boom.notFound('Could not found the record to update.');
    return data;
  }

  async delete ({ userID, _id }) {
    const response = await models.Record.destroy({ where: { _id, userID } });
    if(response === 0) throw boom.notFound('Could not found the record to delete.');
    return recordID;
  }
}

module.exports = RecordService;
