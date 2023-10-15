const { Strategy } = require('passport-local');
const boom = require('@hapi/boom');
const bcrypt = require('bcrypt');
const { models } = require('../../../libs/sequelize');
const RecordService = require('../../../services/recordService');
const FundService = require('../../../services/fundService');

const recordService = new RecordService;
const fundService = new FundService;

const LocalStrategy = new Strategy(
  { usernameField: 'email' },
  async (providedEmail, providedPassword, done) => {
    try {
      const userStored = await models.User.findOne({ where: { email: providedEmail }, raw: true });
      if (userStored === null) return done(boom.unauthorized("The email-password combination is not valid to log you in."), false);

      const passwordMatch = await bcrypt.compare(providedPassword, userStored.password)
      if (!passwordMatch) return done(boom.unauthorized("The email-password combination is not valid to log you in."), false);

      Promise.all([recordService.find(userStored.id), fundService.find(userStored.id)])
        .then(([records, funds]) => done(null, {
          id: userStored.id,
          preferences: userStored.preferences,
          email: userStored.email,
          funds,
          records
        }))
        .catch((err) => done(boom.internal(err), false))
    } catch (error) {
      done(error, false);
    }
  }
);

module.exports = LocalStrategy;
