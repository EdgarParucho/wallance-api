const bcrypt = require('bcrypt');
const boom = require('@hapi/boom');
const { Strategy } = require('passport-local');

const { models } = require('../../../dataAccess/sequelize');

const unauthorizedMsg = "The email-password combination is not valid to log you in.";

const LocalStrategy = new Strategy(
  { usernameField: 'email' },
  async (providedEmail, providedPassword, done) => {
    try {
      const userStored = await models.User.findOne({
        where: { email: providedEmail },
        include: [{
          association: "funds",
          attributes: { exclude: "userID" }
        }]
      });
      if (userStored === null) return done(boom.unauthorized(unauthorizedMsg), false);

      const passwordMatch = await bcrypt.compare(providedPassword, userStored.dataValues.password)
      if (!passwordMatch) return done(boom.unauthorized(unauthorizedMsg), false);

      return done(null, {
        id: userStored.dataValues.id,
        preferences: userStored.dataValues.preferences,
        email: userStored.dataValues.email,
        funds: userStored.dataValues.funds,
      })
    } catch (error) {
      done(error, false);
    }
  }
);

module.exports = LocalStrategy;
