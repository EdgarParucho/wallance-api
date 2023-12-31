const sequelize = require('../dataAccess/sequelize');
const CustomError = require('../utils/customError.js');

const { User } = sequelize.models;

class UserService {

  constructor() {}

  async update({ id, updateEntries }) {
    const user = await User.findByPk(id);
    if (user === null) throw new CustomError(404, "Couldn't find any user with the provided data.");
    await user.update(updateEntries);
    return null;
  }

  async delete(id) {
    const user = await User.findByPk(id);
    if (user === null) throw new CustomError(404, "Couldn't find any user with the provided data.");
    await user.destroy();
    return null;
  }

}

module.exports = UserService;
