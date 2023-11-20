const express = require('express');
const passport = require('passport');
const response = require('../middleware/responseHandler.js');
const payloadValidator = require('../middleware/payloadValidator.js');
const authController = require('../controllers/authController.js');
const { OTPRequestSchema, loginSchema } = require('../thirdParty/joi/authSchema.js');
const { onOTPSending, onLogin } = require('../utils/responseMessages.js');

const router = express.Router();

router.post('/otp',
payloadValidator({ schema: OTPRequestSchema, key: 'body' }),
(req, res, next) => (req.body.email) ? next() : authenticator(req, res, next),
OTPCreationHandler,
);

router.post('/login',
payloadValidator({ schema: loginSchema, key: 'body' }),
passport.authenticate('local', { session: false }),
loginHandler,
);

function authenticator(req, res, next) {
  passport.authenticate('jwt', { session: false })(req, res, next)
}

function OTPCreationHandler(req, res, next) {
  const payload = {
    email: req.body.email || req.user.email,
    emailShouldBeStored: req.body.emailShouldBeStored,
  };
  authController.sendOTP(payload)
    .then(() => response.success(res, { message: onOTPSending }))
    .catch((error) => next(error))
}

function loginHandler(req, res, next) {
  const payload = { ...req.user };
  authController.login(payload)
    .then((data) => response.success(res, { data, message: onLogin }))
    .catch((error) => next(error));
}

module.exports = router;
