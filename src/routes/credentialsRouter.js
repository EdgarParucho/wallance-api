const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { OTPValidationSchema } = require('../schemas/OTPValidationSchema.js');
const { signSchema, loginSchema } = require('../schemas/credentialsSchema.js');
const validatorHandler = require('../middlewares/validatorHandler.js');
const CredentialService = require('../services/credentialService.js');
const config = require('../config/index.js');

const router = express.Router();
const service = new CredentialService();

router.post('/otp', (req, res, next) => {
    if (req.body.action !== "sign") passport.authenticate('jwt', { session: false })(req, res, next)
    else next()
  },
  validatorHandler(OTPValidationSchema, 'body'),
  async (req, res, next) => {
    try {
      const { body } = req;
      body.sign = body.action === "sign" ? body.email : req.user.sub;
      await service.sendOTP(body);
      res.send('A code was sent to the provided email. Please use it to complete the action.');
    } catch (error) {
      next(error);
    }
  }
);

router.post('/sign',
  validatorHandler(signSchema, 'body'),
  async (req, res, next) => {
    try {
      const { body } = req;
      const OTP = req.header('OTP');
      const data = await service.sign({ OTP, ...body });
      res.status(201).send(data);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/login',
  validatorHandler(loginSchema, 'body'),
  passport.authenticate('local', { session: false }),
  async (req, res, next) => {
    try {
      const { id, email, funds } = req.user;
      const secret = config.jwtSecret;
      const payload = { sub: id };
      const token = await jwt.sign(payload, secret);
      const data = { email, funds, token };
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

// router.post('/logout',
//   async (req, res, next) => {
//     try {
//       res.json(data);
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// router.post('/recovery',
//   validatorHandler(preValidationSchema, 'body'),
//   async (req, res, next) => {
//     try {
//       const emailIsNew = true;
//       const data = await service.preValidation(email, emailIsNew);
//       res.send(data);
//     } catch (error) {
//       next(error);
//     }
//   }
// );

module.exports = { credentialsRouter: router, service };
