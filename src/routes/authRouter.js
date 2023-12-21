const express = require('express');
const payloadValidator = require('../middleware/payloadValidator.js');
const authController = require('../controllers/authController.js');
const { OTPRequestSchema, loginSchema } = require('../thirdParty/joi/authSchema.js');
const { checkJWT, checkScopes } = require('../middleware/checkAuthorization.js');

const router = express.Router();

router.post('/otp',
payloadValidator({ schema: OTPRequestSchema, key: 'body' }),
OTPCreationHandler,
);

router.post('/login',
payloadValidator({ schema: loginSchema, key: 'body' }),
checkJWT,
checkScopes,
loginHandler,
);

function loginHandler(req, res, next) {
  const payload = { ...req.body };
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
