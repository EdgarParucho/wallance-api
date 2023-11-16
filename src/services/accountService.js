const boom = require('@hapi/boom');
const { models } = require('../dataAccess/sequelize');
const bcrypt = require('bcrypt');
const { service: credentialsService } = require('../routes/credentialsRouter');

class UserService {

  constructor() {}

  async update({ id, OTP, updateEntries }) {
    const account = await models.User.findByPk(id);
    if (account === null) throw boom.notFound("The requested user couldn't be found.");
    if (Object.keys(updateEntries).length > 1) throw boom.badRequest();
    if (!updateEntries.preferences) credentialsService.validateOTP({ code: OTP, action: "update", sign: id });
    if (updateEntries.password) updateEntries.password = await bcrypt.hash(updateEntries.password, 10);
    await account.update({ ...updateEntries });
    return
  }

  async delete({ OTP, id }) {
    const account = await models.User.findByPk(id);
    if (account === null) throw boom.notFound("The requested user couldn't be found.");
    credentialsService.validateOTP({ code: OTP, action: "delete", sign: id });
    await account.destroy();
    return id;
  }
}

module.exports = UserService;
