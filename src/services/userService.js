const axios = require('../thirdParty/axios');
const sequelize = require('../dataAccess/sequelize');
const CustomError = require('../utils/customError.js');
const { authIss, authClientID, authClientSecret, authGrantType } = require('../config/index.js');

const auth0API =  authIss + 'api/v2';
axios.defaults.baseURL = auth0API;

const { User, Fund } = sequelize.models;

class UserService {

  constructor() {}

  async getManagementAPIAccessToken() {
    const response = await axios.post('oauth/token', new URLSearchParams({
      grant_type: authGrantType,
      client_id: authClientID,
      client_secret: authClientSecret,
      audience: auth0API,
    }))
    const accessToken = response.data.access_token;
    return accessToken;
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
    await axios.patch(`users/${userID}`, body, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    return
  }

  async delete(userID) {
    const user = await User.findByPk(userID);
    if (user === null) throw new CustomError(404, "Couldn't find any user with the provided data.");
    const accessToken = await this.getManagementAPIAccessToken();
    await axios.delete(`users/${userID}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    await user.destroy();
    return null;
  }

}

module.exports = UserService;
