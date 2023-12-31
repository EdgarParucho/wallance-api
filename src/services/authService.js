const { models } = require('../dataAccess/sequelize');
const CustomError = require('../utils/customError.js');

const { User, Fund } = models;

class AuthService {

  constructor() {}

  async login(id) {
    try {
      const userStored = await User.findByPk(id, {
        include: { association: "funds", attributes: { exclude: ["userID"] } },
      });

      if (userStored) return userStored.dataValues;

      const defaultFund = {
        name: 'Main',
        description: 'Base fund, default for credits.',
        isDefault: true,
        balance: 0,
      };

      const userData = { id, funds: [defaultFund] };
      const user = await User.create(userData, { include: [{ model: Fund, as: 'funds', required: true }] });
      delete user.dataValues.funds[0].dataValues.userID;
      delete user.dataValues.id;
      return { ...user.dataValues };
    } catch (error) {
      throw new CustomError(500, error.message || "Internal Server Error");
    }
  }

}

module.exports = AuthService;
