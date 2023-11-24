const jwt = require('jsonwebtoken');
const { v1: OTP } = require('uuid');
const { jwtSecret } = require('../config/index.js');
const { models } = require('../dataAccess/sequelize');
const mailOTP = require('../utils/mailOTP');
const CustomError = require('../utils/customError.js');

const { User } = models;

class AuthService {

  constructor() {
    this.activeOTP = { sub: null, code: null };
  }

  login({ id, funds, preferences, email }) {
    const tokenPayload = { sub: id, email };
    const clientToken = this.createClientToken(tokenPayload);
    const data = { token: clientToken, preferences, funds };
    return data;
  }

  async sendOTP({ email, emailShouldBeStored }) {
    await this.validateEmailInDB({ email, emailShouldBeStored });
    const code = this.generateOTP(email);
    await mailOTP({ to: email, code });
    return;
  }

  async validateEmailInDB({ email, emailShouldBeStored }) {
    const emailStored = await User.findOne({ where: { email } });
    if (!emailShouldBeStored && emailStored) throw new CustomError(409, "The email is already associated to an account.");
    else if (emailShouldBeStored && !emailStored) throw new CustomError(409, "Could not found the provided email.");
    else return
  }

  generateOTP(sub) {
    const code = OTP();
    this.activeOTP.sub = sub;
    this.activeOTP.code = code;
    return code; 
  }

  validateOTP({ code, sub }) {
    const OTPIsValid = (this.activeOTP.code === code && this.activeOTP.sub === sub);
    if (!OTPIsValid) throw new CustomError(401, "The provided code is invalid.");
    else return
  }

  createClientToken(payload) {
    const signedToken = jwt.sign(payload, jwtSecret, { expiresIn: "1h" });
    const { exp } = jwt.decode(signedToken, { secret: jwtSecret });
    const clientToken = { token: signedToken, exp };
    return clientToken;
  }

}

module.exports = AuthService;
