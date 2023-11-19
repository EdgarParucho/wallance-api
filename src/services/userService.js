const bcrypt = require('bcrypt');
const boom = require('@hapi/boom');
const { models } = require('../dataAccess/sequelize');
const AuthService = require('./authService');

const { User } = models;
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
    await User.create(user, { include: [{ model: models.Fund, as: 'funds', required: true }] });
    return 'User created successfully.';
  };

  async update({ id, updateEntries }) {
    const user = await User.findByPk(id);
    if (user === null) throw boom.notFound("The requested user couldn't be found.");
    if (Object.keys(updateEntries).length > 1) throw boom.badRequest();
    if (updateEntries.password) updateEntries.password = await bcrypt.hash(updateEntries.password, 10);
    await user.update({ ...updateEntries });
    const data = (updateEntries.email) ? authService.getClientToken({ sub: id, email: updateEntries.email }) : null;
    return data;
  }

  async delete(id) {
    const user = await User.findByPk(id);
    if (user === null) throw boom.notFound("The requested user couldn't be found.");
    await user.destroy();
    return id;
  }

  async resetPassword({ email, password }) {
    const user = await User.findOne({ where: { email } });
    if (user === null) throw boom.notFound("Couldn't find the user.");
    password = await bcrypt.hash(password, 10);
    await user.update({ password });
    return "Password updated successfully."
  }

}

module.exports = UserService;
