const express = require('express');
const validatorHandler = require('../middlewares/validatorHandler');
const { startSessionSchema } = require('../schemas/sessionSchema');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config');

const router = express.Router();

router.post('/start',
  validatorHandler(startSessionSchema, 'body'),
  passport.authenticate('local', { session: false }),
  async (req, res, next) => {
    try {
      const user = req.user;
      const secret = config.jwtSecret;
      const payload = { sub: user._id };
      const token = jwt.sign(payload, secret);
      res.json({ user, token });
    } catch (error) {
      next(error);
    }
  }
)

module.exports = router;
