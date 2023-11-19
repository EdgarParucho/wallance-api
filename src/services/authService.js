const boom = require('@hapi/boom');
const jwt = require('jsonwebtoken');
const { v1: uuidv1 } = require('uuid');

const { models } = require('../dataAccess/sequelize');
const mailOTP = require('../utils/email/mailOTP');
const config = require('../config/index.js');

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

  async sendOTP({ email, emailShouldBeStored }) {
    await this.validateEmailInDB({ email, emailShouldBeStored });
    const code = this.generateOTP(email);
    await mailOTP({ to: email, code });
    return
  }

  getClientToken(payload) {
    const signedToken = jwt.sign(payload, config.jwtSecret, { expiresIn: "1h" });
    const { exp } = jwt.decode(signedToken, { secret: config.jwtSecret });
    const clientToken = { token: signedToken, exp };
    return clientToken;
  }
  
  login({ id, funds, preferences, email }) {
    const tokenPayload = { sub: id, email };
    const clientToken = this.getClientToken(tokenPayload);
    const data = { token: clientToken, preferences, funds };
    return data;
  }  

}

module.exports = AuthService;
