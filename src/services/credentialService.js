const boom = require('@hapi/boom');
const { models } = require('../libs/sequelize');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { mailHost, mailPort, mailUser, mailPass } = require('../config');
const { v1: uuidv1 } = require('uuid');

class CredentialService {
  
  constructor() {
    this.activeOTP = { sign: null, action: null, code: null };
  }

  generateOTP({ action, sign }) {
    const code = uuidv1();
    this.activeOTP.sign = sign;
    this.activeOTP.action = action;
    this.activeOTP.code = code;
    return code; 
  }

  validateOTP({ code, action, sign }) {
    const OTPIsValid = (
      this.activeOTP.code === code && this.activeOTP.action === action && this.activeOTP.sign === sign
    );
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

  async sendOTP({ action, sign, email, emailShouldBeStored }) {
    const code = this.generateOTP({ action, sign });
    await this.validateEmailInDB({ email, emailShouldBeStored });

    const transporter = nodemailer.createTransport({
      host: mailHost,
      secure: true,
      port: mailPort,
      auth: {
        user: mailUser,
        pass: mailPass
      }
    });

    await transporter.sendMail({
      from: mailUser,
      to: email,
      subject: 'Wallance One Time Password',
      text: `${code} is your code to complete the action in Wallance. If you don't recognize this action, please report the irregularity.`,
      html: `
      <p>Use this code to complete the action in Wallance.</p>
      <h1>${code}</h1>
      <p>If you don't recognize this action, please report the irregularity.</p>
      `
    });

    return
  }

  async sign({ OTP, email, password }) {

    this.validateOTP({ code: OTP, action: "sign", sign: email });
    const hash = await bcrypt.hash(password, 10);

    const defaultFund = {
      name: 'Base',
      description: 'For fixed expenses, and distribute to other funds.',
      isDefault: true
    };

    const user = { email, password: hash, funds: [defaultFund] };

    await models.User.create(user, {
      include: [
        {
          model: models.Fund, as: 'funds',
          required: true
        }
      ]
    });

    return 'User created successfully.';
  };

  async resetPassword({ OTP, email, password }) {
    this.validateOTP({ code: OTP, action: "recovery", sign: email });
    const hash = await bcrypt.hash(password, 10);
    const user = await models.User.findOne({ where: { email } });
    await user.update({ password: hash });
    return 'Password updated successfully.';
  };

}

module.exports = CredentialService;
