const boom = require('@hapi/boom');
const bcrypt = require('bcrypt');
const { models } = require('../libs/sequelize');
const nodemailer = require('nodemailer');
const { mailHost, mailPort, mailUser, mailPass } = require('../config');
const { v4: uuiv4 } = require('uuid');

class UserService {

  constructor() {
    // * https://wallance.atlassian.net/browse/WAL-28
    // * https://wallance.atlassian.net/browse/WAL-50
    this.activeOTP = 0;
    this.OTPIsValid = (OTP) => this.activeOTP === OTP;
  }

  async preValidation(email, mustBeNew) {
    const validateEmail = await models.User.findOne({ where: { email } });
    const emailAlreadySigned = validateEmail !== null;
    if (mustBeNew && emailAlreadySigned) throw boom.badRequest('There is an existing account associated to that email.');
    else if (!mustBeNew && !emailAlreadySigned) throw boom.notFound('Could not found the provided email.');

    // * https://wallance.atlassian.net/browse/WAL-28
    const OTP = Math.floor(Math.random() * (9999 - 1000) + 1000);
    this.activeOTP = OTP;

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
      subject: 'Password recovery',
      text: `Use ${OTP} as code to recover your access to Wallance. If have not requested this action, please contact the admin.`,
      html: `
      <p>Use this code to recover your access to Wallance.</p>
      <h1>${OTP}</h1>
      <p>If have not requested this action, please contact the admin.</p>
      `
    });
    
    
    const feedback = 'An OTP (One Time Password) was sent to the provided email.';
    return feedback;
  }
  
  async create({ OTP, email, password }) {
    const OTPIsValid = this.OTPIsValid(OTP);
    if (!OTPIsValid) throw boom.unauthorized('The provided OTP is not valid.');
    
    const hash = await bcrypt.hash(password, 10);

    const defaultFund = {
      name: 'Base',
      description: 'For fixed expenses, and distribute to other funds.',
      isDefault: true
    };

    const user = { email, password: hash, funds: [defaultFund] };
    await models.User.create(user, { include: [{ model: models.Fund, as: 'funds', required: true }] });
    return 'User created successfully.';
  }

  async update({ id, OTP, body }) {
    const OTPIsValid = this.OTPIsValid(OTP);
    if (!OTPIsValid) throw boom.unauthorized('The provided OTP is not valid.');
    const response = await models.User.update(body, { where: { id }, returning: ['id', 'email', 'credit_sources'] });
    const [totalAffectedRows, [data]] = response;
    if (totalAffectedRows === 0) throw boom.notFound('User not found.')
    return data;
  }

  async delete({ OTP, id }) {
    const OTPIsValid = this.OTPIsValid(OTP);
    if (!OTPIsValid) throw boom.unauthorized('The provided OTP is not valid.');

    const deletingUser = await models.User.findByPk(id);
    if (deletingUser === null) throw boom.notFound('Could not found the requested user.');

    await deletingUser.destroy({ include: ["funds", "records"] });
    return id;
  }
}

module.exports = UserService;
