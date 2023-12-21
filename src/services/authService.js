const { v1: OTP } = require('uuid');
const { models } = require('../dataAccess/sequelize');
const mailOTP = require('../utils/mailOTP');
const CustomError = require('../utils/customError.js');

const { User } = models;

class AuthService {

  constructor() {
    this.activeOTP = { sub: null, code: null };
  }

  async login({ email }) {
    try {
      const userStored = await User.findOne({
        where: { email },
        include: [{ association: "funds", attributes: { exclude: ["userID", "password"] } }],
      });

      if (!userStored) throw new CustomError({
        statusCode: 404,
        message: "User's data couldn't be found with the provided email.",
        data: null
      });

      return userStored.dataValues;
    } catch (error) {
      throw new CustomError({
        statusCode: 500,
        message: error.message || "Internal Server Error",
        data: null
      });
    }
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

}

module.exports = AuthService;
