const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const config = require('../config/index.js');
const authController = require('../controllers/authController.js');
const validatorHandler = require('../middleware/validatorHandler.js');
const { OTPValidationSchema } = require('../middleware/schemaValidation/OTPValidationSchema.js');
const { loginSchema } = require('../middleware/schemaValidation/credentialsSchema.js');

const router = express.Router();

router.post('/otp',
validatorHandler(OTPValidationSchema, 'body'),
validateEmail,
OTPCreationHandler,
)

router.post('/login',
validatorHandler(loginSchema, 'body'),
passport.authenticate('local', { session: false }),
loginHandler,
);

function validateEmail(req, res, next) {
  if (!req.body.email) return passport.authenticate('jwt', { session: false })(req, res, next)
  next()
}

function OTPCreationHandler(req, res, next) {
  const { emailShouldBeStored } = req.body;
  const email = req.body.email || req.user.email;
  console.log(email);
  const payload = email;
  authController.sendOTP(payload, { email, emailShouldBeStored })
    .then(() => res.send('A code was sent to the provided email. Please use it to complete the action.'))
    .catch((error) => next(error))
}

function signJWT(payload) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "1h" });
}

function loginHandler(req, res, next) {
  const { id, funds, preferences, email } = req.user;
  const token = signJWT({ sub: id, email });
  const { exp } = jwt.decode(token, { secret: config.jwtSecret });
  const clientToken = { token, exp };
  const data = { token: clientToken, preferences, funds };
  res.json(data);
}

module.exports = router;
