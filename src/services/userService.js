const axios = require('../thirdParty/axios/index.js');
const sequelize = require('../dataAccess/sequelize.js');
const { authIss, authClientID, authClientSecret, authGrantType } = require('../config/auth.js');

axios.defaults.baseURL = authIss;

const { Fund } = sequelize.models;

class UserService {

  constructor() {}

  async getManagementAPIAccessToken() {
    try {
      const response = await axios.post('/oauth/token', new URLSearchParams({
        grant_type: authGrantType,
        client_id: authClientID,
        client_secret: authClientSecret,
        audience: authIss + '/api/v2/',
      }))
      return response.data.access_token;
    } catch (error) {
      throw new Error(error)
    }
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
    const accessToken = await this.getManagementAPIAccessToken();
    await axios.delete(`api/v2/users/${userID}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    await Fund.destroy({ where: { userID } });
    return null;
  }

}

module.exports = UserService;
