const boom = require('@hapi/boom');
const bcrypt = require('bcrypt');
const { models } = require('../libs/sequelize');
const nodemailer = require('nodemailer');
const { mailHost, mailPort, mailUser, mailPass } = require('../config');
const { v1: uuidv1 } = require('uuid');

class UserService {

  constructor() {
    this.activeOTP = { id: null, action: null, key: null };
    this.OTPIsValid = ({ key, action, id }) => {
      return (this.activeOTP.key === key && this.activeOTP.action === action && this.activeOTP.id === id);
    };
  }

  async preValidation({ email, emailIsNew, action }) {
    const validateEmail = await models.User.findOne({ where: { email } });
    const emailAlreadySigned = validateEmail !== null;
    if (emailIsNew && emailAlreadySigned) throw boom.badRequest('There is an existing account associated to that email.');
    else if (!emailIsNew && !emailAlreadySigned) throw boom.notFound('Could not found the provided email.');

    this.activeOTP.id = email;
    this.activeOTP.action = action;
    this.activeOTP.key = uuidv1();

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
      subject: 'Welcome to Wallance',
      text: `${this.activeOTP.key} is your code to complete the action in Wallance. If you don't recognize this action, please report the irregularity.`,
      html: `
      <p>Use this code to complete the action in Wallance.</p>
      <h1>${this.activeOTP.key}</h1>
      <p>If you don't recognize this action, please report the irregularity.</p>
      `
    });

    const feedback = 'A code was sent to the provided email. Please use it to complete the action.';
    return feedback;
  }

  async create({ OTP, email, password }) {
    const OTPIsValid = this.OTPIsValid({ key: OTP, id: email, action: "create" });
    if (!OTPIsValid) throw boom.unauthorized('The code provided is not valid for this action.');

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
    const OTPIsValid = this.OTPIsValid({ key: OTP, id, action: "update" });
    if (!OTPIsValid) throw boom.unauthorized('The provided OTP is not valid.');
    const response = await models.User.update(body, { where: { id }, returning: ['id', 'email', 'credit_sources'] });
    const [totalAffectedRows, [data]] = response;
    if (totalAffectedRows === 0) throw boom.notFound('User not found.')
    return data;
  }

  async delete({ OTP, id }) {
    const OTPIsValid = this.OTPIsValid({ key: OTP, id, action: "delete" });
    if (!OTPIsValid) throw boom.unauthorized('The provided OTP is not valid.');

    const deletingUser = await models.User.findByPk(id);
    if (deletingUser === null) throw boom.notFound('Could not found the requested user.');

    await deletingUser.destroy({ include: ["funds", "records"] });
    return id;
  }
}

module.exports = UserService;
