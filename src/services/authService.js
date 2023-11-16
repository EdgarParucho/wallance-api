const boom = require('@hapi/boom');
const { v1: uuidv1 } = require('uuid');

const { models } = require('../dataAccess/sequelize');
const mailOTP = require('../utils/email/mailOTP');

class AuthService {

  constructor() {
    this.activeOTP = { sub: null, code: null };
  }

  generateOTP(sub) {
    const code = uuidv1();
    this.activeOTP.sub = sub;
    this.activeOTP.code = code;
    return code; 
  }

  validateOTP({ code, sub }) {
    const OTPIsValid = (this.activeOTP.code === code && this.activeOTP.sub === sub);
    if (!OTPIsValid) throw boom.unauthorized('The provided OTP is not valid.');
    return
  };

  async validateEmailInDB({ email, emailShouldBeStored }) {
    const emailStored = await models.User.findOne({ where: { email } });
    const emailIsStored = emailStored !== null;
    if (!emailShouldBeStored && emailIsStored) throw boom.badRequest('The email is already associated to an account.');
    else if (emailShouldBeStored && !emailIsStored) throw boom.notFound('Could not found the provided email.');
    return
  }

  async sendOTP(sub, { email, emailShouldBeStored }) {
    await this.validateEmailInDB({ email, emailShouldBeStored });
    const code = this.generateOTP(sub);
    await mailOTP({ to: email, code });
    return
  }

}

module.exports = AuthService;
