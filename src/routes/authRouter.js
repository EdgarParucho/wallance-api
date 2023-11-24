const express = require('express');
const passport = require('passport');
const payloadValidator = require('../middleware/payloadValidator.js');
const authController = require('../controllers/authController.js');
const { OTPRequestSchema, loginSchema } = require('../thirdParty/joi/authSchema.js');

const router = express.Router();

router.post('/otp',
payloadValidator({ schema: OTPRequestSchema, key: 'body' }),
(req, res, next) => (req.body.email) ? next() : tokenValidator(req, res, next),
OTPCreationHandler,
);

router.post('/login',
payloadValidator({ schema: loginSchema, key: 'body' }),
authenticator,
loginHandler,
);

function authenticator(req, res, next) {
  passport.authenticate('local', { session: false })(req, res, next)
}

function tokenValidator(req, res, next) {
  passport.authenticate('jwt', { session: false })(req, res, next)
}

function loginHandler(req, res, next) {
  const payload = { ...req.user };
  authController.login(payload)
    .then((data) => res.status(200).json({
      data,
      message: "It's great that you're here.",
    }))
    .catch((error) => next(error));
}

function OTPCreationHandler(req, res, next) {
  const payload = {
    email: req.body.email || req.user.email,
    emailShouldBeStored: req.body.emailShouldBeStored,
  };
  authController.sendOTP(payload)
    .then(() => res.status(200).json({
      data: null,
      message: "A code was sent to the provided email. Please use it to complete the action."
    }))
    .catch((error) => next(error))
}

module.exports = router;
