const { Strategy } = require('passport-local');
const UserService = require('../../../services/userService');
const boom = require('@hapi/boom');
const bcrypt = require('bcrypt');
const { models } = require('../../../libs/sequelize');

const LocalStrategy = new Strategy(
  { usernameField: 'email' },
  async (providedEmail, providedPassword, done) => {
    try {

      const data = await models.User.findOne({ where: { email: providedEmail }, include: ['funds'] });
      if (!data) return done(boom.unauthorized("The email-password combination is not valid to log you in."), false);
      const passwordMatch = await bcrypt.compare(providedPassword, data.password);
      if (!passwordMatch) return done(boom.unauthorized("The email-password combination is not valid to log you in."), false);

      const { _id, email, creditSources, funds } = data;
      const user = { _id, email, creditSources, funds };
      return done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
);

module.exports = LocalStrategy;
