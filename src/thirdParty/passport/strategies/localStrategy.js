const bcrypt = require('bcrypt');
const { Strategy } = require('passport-local');
const { models } = require('../../../dataAccess/sequelize');

const responseOnInvalidAuth = {
  statusCode: 401,
  message: "Email-Password combination is not valid.",
  data: null
};

const LocalStrategy = new Strategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const userStored = await models.User.findOne({
        where: { email },
        include: [{ association: "funds", attributes: { exclude: "userID" } }],
      });

      if (!userStored) return done(responseOnInvalidAuth, null);
      const passwordMatch = await bcrypt.compare(password, userStored.dataValues.password)
      if (!passwordMatch) return done(responseOnInvalidAuth, null);

      return done(null, {
        id: userStored.dataValues.id,
        preferences: userStored.dataValues.preferences,
        email: userStored.dataValues.email,
        funds: userStored.dataValues.funds,
      })
    } catch (error) {
      done(error, null);
    }
  }
);

module.exports = LocalStrategy;
