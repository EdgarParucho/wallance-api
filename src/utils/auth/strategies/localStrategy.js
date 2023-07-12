const { Strategy } = require('passport-local');
const boom = require('@hapi/boom');
const bcrypt = require('bcrypt');
const { models } = require('../../../libs/sequelize');

const LocalStrategy = new Strategy(
  { usernameField: 'email' },
  async (providedEmail, providedPassword, done) => {
    try {
      const userStored = await models.User.findOne({
        where: {
          email: providedEmail
        },
        include: [
          {
            association: "records",
            attributes: { exclude: "userID" }
          },
          {
            association: "funds",
            attributes: { exclude: "userID" }
          }
        ]
      });
      if (userStored === null) return done(boom.unauthorized("The email-password combination is not valid to log you in."), false);
      const passwordMatch = await bcrypt.compare(providedPassword, userStored.dataValues.password);
      if (!passwordMatch) return done(boom.unauthorized("The email-password combination is not valid to log you in."), false);
      
      const { id, email, funds, records } = userStored;
      const user = { id, email, funds, records };
      return done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
);

module.exports = LocalStrategy;
