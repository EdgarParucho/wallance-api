const axios = require('../thirdParty/axios');
const sequelize = require('../dataAccess/sequelize');
const CustomError = require('../utils/customError.js');
const { authIss, authClientID, authClientSecret, authGrantType } = require('../config/index.js');

const AUTH0_DOMAIN =  authIss;
axios.defaults.baseURL = AUTH0_DOMAIN;

const { User, Fund } = sequelize.models;

class UserService {

  constructor() {}

  async getManagementAPIAccessToken() {
    try {
      const response = await axios.post('/oauth/token', new URLSearchParams({
        grant_type: authGrantType,
        client_id: authClientID,
        client_secret: authClientSecret,
        audience: AUTH0_DOMAIN + 'api/v2/',
      }))
      const accessToken = response.data.access_token;
      return accessToken;
    } catch (error) {
      throw new Error(error)
    }
  }

  async getUser(userID) {
    try {
      const userStored = await User.findByPk(userID, {
        include: { association: "funds", attributes: { exclude: ["userID"] } },
      });
      if (userStored) return userStored.dataValues;
      else return this.createUser(userID)
    } catch (error) {
      throw new CustomError(500, error.message || "Internal Server Error");
    }
  }

  async createUser(userID) {
    const defaultFund = {
      name: 'Main',
      description: 'Base fund, default for credits.',
      isDefault: true,
      balance: 0,
    };

    const userData = { id: userID, funds: [defaultFund] };
    const user = await User.create(userData, {
      include: [{ model: Fund, as: 'funds', required: true }]
    });

    delete user.dataValues.funds[0].dataValues.userID;
    delete user.dataValues.id;

    return { ...user.dataValues };
  }

  async update({ userID, body }) {
    const accessToken = await this.getManagementAPIAccessToken();
    try {
      await axios.patch(`api/v2/users/${userID}`, body, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })
      return
    } catch (error) {
      throw new Error(error.statusCode, error.message)
    }
  }

  async delete(userID) {
    const user = await User.findByPk(userID);
    if (user === null) throw new CustomError(404, "Couldn't find any user with the provided data.");
    const accessToken = await this.getManagementAPIAccessToken();
    await axios.delete(`api/v2/users/${userID}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    await user.destroy();
    return null;
  }

}

module.exports = UserService;
