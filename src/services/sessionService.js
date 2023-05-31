const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');

class SessionService {
  
  constructor() {
    this.session = {};
    this.OTP = 0;
  }

  async start({ email, password }) {
    const data = await models.User.findOne({ where: { email, password }, include: ['funds'] });
    if (data === null) throw boom.notFound('The email-password combination is invalid.');
    return data;
  }
}

module.exports = SessionService;