const bcrypt = require('bcrypt');
const sequelize = require('../dataAccess/sequelize');
const CustomError = require('../utils/customError.js');
const AuthService = require('./authService');

const { Fund, User } = sequelize.models;
const authService = new AuthService();

class UserService {

  constructor() {}

  async create({ email, password }) {
    const hash = await bcrypt.hash(password, 10);

    const defaultFund = {
      name: 'Main',
      description: 'For fixed expenses, and assigning to other funds.',
      isDefault: true
    };

    const user = { email, password: hash, funds: [defaultFund] };
    await User.create(user, { include: [{ model: Fund, as: 'funds', required: true }] });
    return null;
  };

  async update({ id, updateEntries }) {
    const user = await User.findByPk(id);
    if (user === null) throw new CustomError(404, "Couldn't find any user with the provided data.");
    if (Object.keys(updateEntries).length > 1) throw new CustomError(409, "There is a problem with the data you're trying to update.");
    if (updateEntries.password) updateEntries.password = await bcrypt.hash(updateEntries.password, 10);
    await user.update({ ...updateEntries });
    const data = (updateEntries.email) ? authService.createClientToken({ sub: id, email: updateEntries.email }) : null;
    return data;
  }

  async delete(id) {
    const user = await User.findByPk(id);
    if (user === null) throw new CustomError(404, "Couldn't find any user with the provided data.");
    await user.destroy();
    return null;
  }

  async resetPassword({ email, password }) {
    const user = await User.findOne({ where: { email } });
    if (user === null) throw new CustomError(404, "Couldn't find any user with the provided data.");
    password = await bcrypt.hash(password, 10);
    await user.update({ password });
    return null;
  }

}

module.exports = UserService;
