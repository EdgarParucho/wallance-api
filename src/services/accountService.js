const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');
const bcrypt = require('bcrypt');
const { service: credentialsService } = require('../routes/credentialsRouter');

class UserService {

  constructor() {}

  async update({ id, OTP, updateEntries }) {
    const account = await models.User.findByPk(id);
    if (account === null) throw boom.notFound("The requested user couldn't be found.");
    credentialsService.validateOTP({ code: OTP, action: "update", sign: id });
    if (updateEntries.password) updateEntries.password = await bcrypt.hash(updateEntries.password, 10);
    await account.update({ password: updateEntries.password });
    if (updateEntries.email) return { email: updateEntries.email }
    else return
  }

  async delete({ OTP, id }) {
    const account = await models.User.findByPk(id);
    if (account === null) throw boom.notFound("The requested user couldn't be found.");
    credentialsService.validateOTP({ code: OTP, action: "delete", sign: id });
    // includes records and funds?
    await account.destroy();
    return id;
  }
}

module.exports = UserService;
